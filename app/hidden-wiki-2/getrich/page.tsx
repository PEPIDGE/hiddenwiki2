import { redirect } from "next/navigation"

// GETRICH was the old browser-only coin page. Hidden Coins are now earned
// only through the server-verified tasks in /moneytasks.
export default function GetRichPage() {
  redirect("/hidden-wiki-2/moneytasks")
}
