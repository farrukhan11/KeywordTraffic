import { signOut } from "@/auth";
export default function SignOutButton(){return <form action={async()=>{"use server";await signOut({redirectTo:"/"});}}><button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">Sign out</button></form>}
