import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`🚀 Bun + Express (TS) running on port ${env.PORT}`);
});
