import { expect, test } from "@playwright/test";
import { spawn, execFile, type ChildProcess } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import {
  createServer as createHttpsServer,
  type Server as HttpsServer,
} from "node:https";
import { createServer as createTcpServer, type AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function availablePort() {
  const listener = createTcpServer();
  await new Promise<void>((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const port = (listener.address() as AddressInfo).port;
  await new Promise<void>((resolve, reject) =>
    listener.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function stopChild(child: ChildProcess | undefined) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => child.kill("SIGKILL"), 2000);
    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
    child.kill("SIGTERM");
  });
}

test("real server verifies TLS and reports success only when its local delivery receiver accepts the enquiry", async ({
  request,
}) => {
  test.setTimeout(30000);
  const temporary = await mkdtemp(
    path.join(tmpdir(), "precision-delivery-test-"),
  );
  let receiver: HttpsServer | undefined;
  let application: ChildProcess | undefined;
  try {
    const keyPath = path.join(temporary, "localhost-key.pem");
    const certificatePath = path.join(temporary, "localhost-cert.pem");
    await execFileAsync(
      "openssl",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-keyout",
        keyPath,
        "-out",
        certificatePath,
        "-days",
        "1",
        "-subj",
        "/CN=localhost",
        "-addext",
        "subjectAltName=DNS:localhost,IP:127.0.0.1",
      ],
      { timeout: 10000 },
    );

    const received: {
      pathname: string | undefined;
      authorization: string | undefined;
      payload: Record<string, unknown>;
    }[] = [];
    let receiverStatus = 200;
    receiver = createHttpsServer(
      { key: await readFile(keyPath), cert: await readFile(certificatePath) },
      async (incoming, response) => {
        const chunks: Buffer[] = [];
        for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
        received.push({
          pathname: incoming.url,
          authorization: incoming.headers.authorization,
          payload: JSON.parse(Buffer.concat(chunks).toString("utf8")),
        });
        response.writeHead(receiverStatus, {
          "Content-Type": "application/json",
        });
        response.end(JSON.stringify({ received: receiverStatus === 200 }));
      },
    );
    await new Promise<void>((resolve, reject) => {
      receiver!.once("error", reject);
      receiver!.listen(0, "127.0.0.1", resolve);
    });
    const receiverPort = (receiver.address() as AddressInfo).port;
    const appPort = await availablePort();
    const baseURL = `http://127.0.0.1:${appPort}`;
    const dummyToken = "dummy-local-integration-test-token";
    application = spawn(process.execPath, ["server/index.mjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(appPort),
        HOST: "127.0.0.1",
        ESTIMATE_WEBHOOK_URL: `https://127.0.0.1:${receiverPort}/enquiries`,
        ESTIMATE_WEBHOOK_TOKEN: dummyToken,
        NODE_EXTRA_CA_CERTS: certificatePath,
      },
      stdio: "ignore",
    });
    let spawnError: Error | undefined;
    application.once("error", (error) => {
      spawnError = error;
    });
    await expect
      .poll(
        async () => {
          if (spawnError) throw spawnError;
          if (application!.exitCode !== null)
            throw new Error(
              "The isolated delivery test server exited before becoming ready.",
            );
          try {
            return (
              await request.get(`${baseURL}/api/estimate/status`, {
                timeout: 500,
              })
            ).status();
          } catch {
            return 0;
          }
        },
        { timeout: 10000, intervals: [100, 200, 500] },
      )
      .toBe(200);
    const status = await request.get(`${baseURL}/api/estimate/status`);
    expect(await status.json()).toEqual({ enabled: true });

    const payload = {
      name: "  Local Delivery Test  ",
      email: "local-delivery@example.com",
      phone: "",
      location: "  Toronto  ",
      service: "interior-strip-outs",
      description:
        "  A test enquiry for the local integration receiver only.  ",
      timeline: "",
      consent: true,
      website: "",
      unexpectedProperty: "must not be forwarded",
    };
    const accepted = await request.post(`${baseURL}/api/estimate`, {
      data: payload,
    });
    expect(accepted.status()).toBe(200);
    const result = await accepted.json();
    expect(result.accepted).toBe(true);
    expect(typeof result.reference).toBe("string");
    expect(received).toHaveLength(1);
    expect(received[0].pathname).toBe("/enquiries");
    expect(received[0].authorization).toBe(`Bearer ${dummyToken}`);
    expect(received[0].payload).toMatchObject({
      id: result.reference,
      source: "precision-demolition-website",
      name: "Local Delivery Test",
      email: "local-delivery@example.com",
      location: "Toronto",
      description: "A test enquiry for the local integration receiver only.",
      consent: true,
    });
    expect(received[0].payload).not.toHaveProperty("website");
    expect(received[0].payload).not.toHaveProperty("unexpectedProperty");
    expect(received[0].payload).not.toHaveProperty("authorization");
    expect(
      Number.isNaN(Date.parse(String(received[0].payload.submittedAt))),
    ).toBe(false);

    receiverStatus = 500;
    const rejected = await request.post(`${baseURL}/api/estimate`, {
      data: payload,
    });
    expect(rejected.status()).toBe(502);
    const rejectedResult = await rejected.json();
    expect(rejectedResult).toHaveProperty(
      "error",
      "Delivery could not be confirmed. Please try again.",
    );
    expect(rejectedResult.accepted).toBeUndefined();
    expect(received).toHaveLength(2);
  } finally {
    await stopChild(application);
    if (receiver) {
      receiver.closeAllConnections();
      await new Promise<void>((resolve) => receiver!.close(() => resolve()));
    }
    await rm(temporary, { recursive: true, force: true });
  }
});
