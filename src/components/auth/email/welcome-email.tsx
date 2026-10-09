import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "react-email";

import { cn } from "../../../lib/utils";
import {
  type EmailClassNames,
  type EmailColors,
  EmailStyles,
} from "./email-styles";

export interface WelcomeEmailProps {
  /** Magic link URL for passwordless authentication */
  url: string;
  /** Email address of the user */
  email?: string;
  /** Name of the invited guest */
  name?: string;
  /** Name of the application */
  appName?: string;
  /** Website URL */
  siteUrl?: string;
  /** Expiration time in minutes */
  expirationMinutes?: number;
  /** Custom CSS class names */
  classNames?: EmailClassNames;
  /** Custom color scheme */
  colors?: EmailColors;
  /** Dark mode enabled */
  darkMode?: boolean;
  /** Additional React nodes to inject into head */
  head?: ReactNode;
}

const defaultWelcomeColors: EmailColors = {
  light: {
    background: "#FFFFFF",
    border: "#E5E5E5",
    card: "#FFFFFF",
    cardForeground: "#0A0A0A",
    foreground: "#0A0A0A",
    muted: "#F5F5F5",
    mutedForeground: "#737373",
    primary: "#007595",
    primaryForeground: "#ECFEFF",
  },
};

export const WelcomeEmail = ({
  url,
  email,
  name,
  appName = "Home Manager",
  siteUrl = "https://home.mic0.me",
  expirationMinutes = 5,
  colors = defaultWelcomeColors,
  classNames,
  darkMode = false,
  head,
}: WelcomeEmailProps) => {
  const displaySite = siteUrl.replace(/^https?:\/\//, "");
  const previewText = `Welcome to ${appName}! Access doors and Wi-Fi at ${displaySite}.`;
  const greeting = name ? `Welcome, ${name}!` : `Welcome to ${appName}!`;

  return (
    <Html>
      <Head>
        <meta content="light dark" name="color-scheme" />
        <meta content="light dark" name="supported-color-schemes" />
        <EmailStyles colors={colors} darkMode={darkMode} />
        {head}
      </Head>

      <Preview>{previewText}</Preview>

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className={cn("bg-background font-sans", classNames?.body)}>
          <Container
            className={cn(
              "mx-auto my-auto max-w-xl px-2 py-10",
              classNames?.container,
            )}
          >
            <Section
              className={cn(
                "bg-card text-card-foreground rounded-lg border border-border p-8",
                classNames?.card,
              )}
            >
              <Text className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                {appName}
              </Text>

              <Heading
                className={cn(
                  "m-0 mb-4 text-2xl font-bold tracking-tight text-foreground",
                  classNames?.title,
                )}
              >
                {greeting}
              </Heading>

              <Text
                className={cn(
                  "m-0 mb-6 text-sm leading-relaxed text-muted-foreground",
                  classNames?.content,
                )}
              >
                You have been invited as a guest with access to our home
                dashboard at{" "}
                <Link
                  href={siteUrl}
                  className="font-medium text-primary underline"
                >
                  {displaySite}
                </Link>
                .
              </Text>

              {/* What you can do section */}
              <Section className="my-6 rounded-md border border-border bg-muted p-5">
                <Heading
                  as="h3"
                  className="m-0 mb-3 text-sm font-semibold text-foreground"
                >
                  What you can do on the dashboard
                </Heading>

                <Section className="mb-3">
                  <Text className="m-0 text-sm font-medium text-foreground">
                    🚪 Unlock Doors
                  </Text>
                  <Text className="m-0 mt-1 text-xs leading-relaxed text-muted-foreground">
                    Remotely open and unlock house entrances from your device with a single click.
                  </Text>
                </Section>

                <Section>
                  <Text className="m-0 text-sm font-medium text-foreground">
                    📶 View Wi-Fi Details
                  </Text>
                  <Text className="m-0 mt-1 text-xs leading-relaxed text-muted-foreground">
                    Instantly view the guest Wi-Fi network name and copy the
                    password to get connected right away.
                  </Text>
                </Section>
              </Section>

              {/* Instructions on how to sign in */}
              <Section className="my-6 rounded-md border border-border bg-card p-5">
                <Heading
                  as="h3"
                  className="m-0 mb-2 text-sm font-semibold text-foreground"
                >
                  How to sign in
                </Heading>
                <Text className="m-0 mb-2 text-xs leading-relaxed text-muted-foreground">
                  <strong>One-Click Sign In:</strong> Click the button below to
                  instantly sign in to the dashboard. No password is required,
                  and you will be securely logged in.
                </Text>
                <Text className="m-0 text-xs leading-relaxed text-muted-foreground">
                  <strong>Future Visits:</strong> Whenever you need to access
                  the dashboard again, visit{" "}
                  <Link
                    href={siteUrl}
                    className="font-medium text-primary underline"
                  >
                    {displaySite}
                  </Link>
                  , enter your email{email && ` (${email})`}, and we will send
                  a fresh sign-in link to your inbox.
                </Text>
              </Section>

              {/* Primary Call to Action */}
              <Section className="my-6 text-center">
                <Button
                  href={url}
                  className={cn(
                    "inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground no-underline shadow-sm",
                    classNames?.button,
                  )}
                >
                  Sign In to Home Manager
                </Button>
              </Section>

              <Text
                className={cn(
                  "m-0 mb-2 text-xs text-muted-foreground",
                  classNames?.description,
                )}
              >
                Or copy and paste this sign-in URL into your browser:
              </Text>

              <Link
                className={cn(
                  "break-all text-xs text-primary underline",
                  classNames?.link,
                )}
                href={url}
              >
                {url}
              </Link>

              <Hr
                className={cn(
                  "my-6 w-full border border-solid border-border",
                  classNames?.separator,
                )}
              />

              <Text
                className={cn(
                  "m-0 mb-2 text-xs text-muted-foreground",
                  classNames?.description,
                )}
              >
                This sign-in link expires in {expirationMinutes} minutes.
              </Text>

              <Text
                className={cn(
                  "m-0 text-xs text-muted-foreground",
                  classNames?.description,
                )}
              >
                If you did not expect this invitation, please ignore this email.
                No action is required on your part.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
