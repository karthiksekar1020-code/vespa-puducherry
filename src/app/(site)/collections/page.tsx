import { redirect } from "next/navigation";

/** The Collections page was replaced by Compare bikes; old links go there. */
export default function CollectionsPage() {
  redirect("/compare");
}
