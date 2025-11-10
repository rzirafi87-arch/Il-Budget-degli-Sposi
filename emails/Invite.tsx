import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

export default function InviteEmail({ name, link }: { name: string; link: string }) {
  return (
    <Html>
      <Head />
      <Preview>Il tuo invito su MYBUDGETEVENTO</Preview>
      <Body style={{ backgroundColor: "#f6f6f6" }}>
        <Container style={{ background: "#fff", padding: 24, borderRadius: 12 }}>
          <Heading>Benvenut* {name ?? "ospite"} 👋</Heading>
          <Text>Accedi qui al tuo invito:</Text>
          <Text><a href={link}>{link}</a></Text>
          <Text style={{ color: "#666" }}>Grazie da MYBUDGETEVENTO</Text>
        </Container>
      </Body>
    </Html>
  );
}
