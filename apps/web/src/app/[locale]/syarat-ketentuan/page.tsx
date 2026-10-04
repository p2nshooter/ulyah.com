import { LegalPage, legalMetadata } from "@/components/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return legalMetadata("terms", params);
}

export default function TermsPage({ params }: Props) {
  return <LegalPage pageKey="terms" params={params} />;
}
