import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
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
  /** Name of the application sending the email */
  appName?: string;
  /** Website URL */
  siteUrl?: string;
  /** Number of minutes until the magic link expires */
  expirationMinutes?: number;
  /** Logo URL(s) - a single string or light/dark variants. */
  logoURL?: string | { light: string; dark: string };
  /** Custom CSS class names for styling specific parts of the email */
  classNames?: EmailClassNames;
  /** Custom color scheme for light and dark modes */
  colors?: EmailColors;
  /** Whether to show the "Powered by better-auth" footer */
  poweredBy?: boolean;
  /** Whether to enable dark mode support */
  darkMode?: boolean;
  /** Additional React nodes to inject into the email head */
  head?: ReactNode;
}

export const WelcomeEmail = ({
  url,
  email,
  name,
  appName = "Home Manager",
  siteUrl = "https://home.mic0.me",
  expirationMinutes = 5,
  logoURL,
  colors,
  classNames,
  darkMode = true,
  poweredBy,
  head,
}: WelcomeEmailProps) => {
  const displaySite = siteUrl.replace(/^https?:\/\//, "");
  const previewText = `Welcome to ${appName}! Access doors and Wi-Fi at ${displaySite}.`;
  const headingTitle = name
    ? `Welcome to ${appName}, ${name}`
    : `Welcome to ${appName}`;

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
                "bg-card text-card-foreground rounded-none border border-border p-8",
                classNames?.card,
              )}
            >
              {logoURL &&
                (typeof logoURL === "string" ? (
                  <Img
                    src={logoURL}
                    width={48}
                    height={48}
                    alt={appName}
                    className={cn("mx-auto mb-8", classNames?.logo)}
                  />
                ) : (
                  <>
                    <Img
                      src={logoURL.light}
                      width={48}
                      height={48}
                      alt={appName}
                      className={cn(
                        "mx-auto mb-8 logo-light",
                        classNames?.logo,
                      )}
                    />
                    <Img
                      src={logoURL.dark}
                      width={48}
                      height={48}
                      alt={appName}
                      className={cn(
                        "hidden mx-auto mb-8 logo-dark",
                        classNames?.logo,
                      )}
                    />
                  </>
                ))}

              <Heading
                className={cn(
                  "m-0 mb-5 text-2xl font-semibold",
                  classNames?.title,
                )}
              >
                {headingTitle}
              </Heading>

              <Text
                className={cn("m-0 text-sm font-normal", classNames?.content)}
              >
                You have been invited as a guest with access to the dashboard at{" "}
                <Link
                  href={siteUrl}
                  className={cn("text-primary font-medium", classNames?.link)}
                >
                  {displaySite}
                </Link>
                .
              </Text>

              {/* What you can do section */}
              <Section
                className={cn(
                  "my-6 border border-border bg-muted p-4",
                  classNames?.codeBlock,
                )}
              >
                <Text
                  className={cn(
                    "m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    classNames?.description,
                  )}
                >
                  What you can do
                </Text>

                <Section className="mb-4">
                  <Text
                    className={cn(
                      "m-0 text-sm font-semibold text-card-foreground",
                      classNames?.content,
                    )}
                  >
                    🚪 Unlock Doors
                  </Text>
                  <Text
                    className={cn(
                      "m-0 mt-1 text-xs text-muted-foreground",
                      classNames?.description,
                    )}
                  >
                    Remotely unlock house entrances directly from your device.
                  </Text>
                </Section>

                <Section>
                  <Text
                    className={cn(
                      "m-0 text-sm font-semibold text-card-foreground",
                      classNames?.content,
                    )}
                  >
                    📶 View Wi-Fi Details
                  </Text>
                  <Text
                    className={cn(
                      "m-0 mt-1 text-xs text-muted-foreground",
                      classNames?.description,
                    )}
                  >
                    View the guest Wi-Fi network credentials and copy the
                    password with a single click.
                  </Text>
                </Section>
              </Section>

              {/* Instructions on how to sign in */}
              <Section
                className={cn(
                  "my-6 border border-border bg-muted p-4",
                  classNames?.codeBlock,
                )}
              >
                <Text
                  className={cn(
                    "m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    classNames?.description,
                  )}
                >
                  How to sign in
                </Text>

                <Text
                  className={cn(
                    "m-0 mb-2 text-xs leading-relaxed text-muted-foreground",
                    classNames?.description,
                  )}
                >
                  • <strong>One-Click Sign In:</strong> Click the button below
                  to immediately sign in using your one-time magic link — no
                  password needed.
                </Text>
                <Text
                  className={cn(
                    "m-0 text-xs leading-relaxed text-muted-foreground",
                    classNames?.description,
                  )}
                >
                  • <strong>Future Visits:</strong> Whenever you need to return,
                  visit{" "}
                  <Link
                    href={siteUrl}
                    className={cn("text-primary font-medium", classNames?.link)}
                  >
                    {displaySite}
                  </Link>
                  , enter your email ({email || "guest@example.com"}), and you
                  will receive a fresh sign-in link.
                </Text>
              </Section>

              <Section className="my-6">
                <Button
                  href={url}
                  className={cn(
                    "inline-block whitespace-nowrap rounded-none text-sm font-medium py-2.5 px-6 bg-primary text-primary-foreground no-underline",
                    classNames?.button,
                  )}
                >
                  Sign in to {appName}
                </Button>
              </Section>

              <Text
                className={cn(
                  "m-0 mb-3 text-xs text-muted-foreground",
                  classNames?.description,
                )}
              >
                Or copy and paste this URL into your browser:
              </Text>

              <Link
                className={cn(
                  "break-all text-xs text-primary",
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

              {expirationMinutes || appName ? (
                <Text
                  className={cn(
                    "m-0 mb-3 text-xs text-muted-foreground",
                    classNames?.description,
                  )}
                >
                  {expirationMinutes
                    ? `This link expires in ${expirationMinutes} minutes.`
                    : null}
                  {appName ? ` Email sent by ${appName}.` : null}
                </Text>
              ) : null}

              <Text
                className={cn(
                  "m-0 text-xs text-muted-foreground",
                  classNames?.description,
                )}
              >
                If you didn&apos;t request this email, you can safely ignore it.
              </Text>

              {poweredBy && (
                <Text
                  className={cn(
                    "m-0 mt-4 text-center text-[11px] text-muted-foreground",
                    classNames?.poweredBy,
                  )}
                >
                  Powered by{" "}
                  <Link
                    href="https://better-auth.com"
                    className={cn(
                      "text-primary underline",
                      classNames?.link,
                    )}
                  >
                    better-auth
                  </Link>
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
