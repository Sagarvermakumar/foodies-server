import app from "./app.js";
import { config } from "./config/env.js";
import connectDB from "./config/database.js";




//connect to database
connectDB();



// Start the server
app.listen(config.PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${config.PORT}`);


});

