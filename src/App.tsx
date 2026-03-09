import { GridCanvas } from '@/components/simulation/GridCanvas';
import { Sidebar } from '@/components/simulation/Sidebar';

export function App() {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-retro-bg">
      {/* Main grid area */}
      <GridCanvas />

      {/* Control sidebar */}
      <Sidebar />
    </div>
  );
}
