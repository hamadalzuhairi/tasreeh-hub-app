import { redirect } from "next/navigation";

// The API has no UI of its own; anyone opening the bare domain is sent to the app website.
const APP_URL = process.env.APP_URL || "https://tasreeh-hub.vercel.app";

export default function Home() {
  redirect(APP_URL);
}
