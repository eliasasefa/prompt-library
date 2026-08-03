import { auth } from "@/auth";
import Landing from "../components/landing";
import Dashboard from "../components/dashboard";

export default async function Home() {
  const session = await auth();
  if (!session?.user) return <Landing />;
  return <Dashboard session={session} />;
}