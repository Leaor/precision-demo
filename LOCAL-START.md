# Open Precision Demolition on your computer

This download includes the built website. Run it on your own computer so `localhost` points to the right machine.

1. Extract the ZIP. Keep the entire `precision-demolition` folder together.
2. Install **Node.js 24 LTS** from [nodejs.org](https://nodejs.org/) if Node.js and npm are not already installed.
3. Open Terminal, type `cd `, drag the extracted folder into the Terminal window, and press Return.
4. Run:

   ```sh
   bash start-local.command
   ```

The first start installs the required packages and needs an internet connection. On a Mac, the script opens **http://localhost:5173/** once the server responds. You can also open that address yourself. Keep Terminal open while using the website; press **Control-C** to stop it.

If port 5173 is already occupied, stop the application using it or choose another port:

```sh
PORT=5174 bash start-local.command
```

Then use **http://localhost:5174/**. The script never stops another application for you.

The estimate form prepares a downloadable draft until a real enquiry delivery destination is configured. Nothing is sent in the default local configuration. See `README.md` for content editing, development mode and launch details.
