import { WizardProvider } from './components/WizardProvider';
import { LogoutButton } from '@/components/LogoutButton';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">How to Live</h1>
              <p className="text-sm text-muted-foreground">Blog Post Creator</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </WizardProvider>
  );
}
