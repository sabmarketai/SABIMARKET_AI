import BottomNav from "@/components/shared/BottomNav";
import ProtectedLayout from "@/providers/protectedLayout";
import OnboardingGuard from "@/components/shared/OnboardingGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <OnboardingGuard>
        <div>
          <div>{children}</div>
          <BottomNav />
        </div>
      </OnboardingGuard>
    </ProtectedLayout>
  );
}
