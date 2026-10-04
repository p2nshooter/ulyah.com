import { LegalPage, legalMetadata } from "@/components/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return legalMetadata("cookies", params);
}

export default function CookiePolicyPage({ params }: Props) {
  return <LegalPage pageKey="cookies" params={params} />;
}
