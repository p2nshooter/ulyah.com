import { LegalPage, legalMetadata } from "@/components/LegalPage";

type Props = { params: Promise<{ locale: string }> };

export function generateMetadata({ params }: Props) {
  return legalMetadata("disclaimer", params);
}

export default function DisclaimerPage({ params }: Props) {
  return <LegalPage pageKey="disclaimer" params={params} />;
}
