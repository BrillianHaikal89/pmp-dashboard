// components/common/LoadingScreen.tsx
export function LoadingScreen({ msg }: { msg?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm font-medium">{msg ?? "Memuat data..."}</p>
      </div>
    </div>
  );
}