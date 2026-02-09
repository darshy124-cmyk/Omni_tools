import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";

const handler = NextAuth({
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 1025),
        auth: {
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || ""
        }
      },
      from: process.env.EMAIL_FROM
    })
  ],
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
