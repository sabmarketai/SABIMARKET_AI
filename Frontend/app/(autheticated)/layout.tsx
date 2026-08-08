import BottomNav from "@/components/shared/BottomNav";
import ProtectedLayout from "@/providers/protectedLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div>
        <div>{children}</div>
        <BottomNav />
      </div>
    </ProtectedLayout>
  );
}
