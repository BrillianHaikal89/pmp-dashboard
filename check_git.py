import subprocess

result = subprocess.run(['git', 'show', 'HEAD:app/dashboard-provinsi/page.tsx'], capture_output=True, text=True, encoding='utf-8')
lines = result.stdout.split('\n')

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '{/* Tab: Indikator Prioritas */}' in line:
        start_idx = i
    if '{/* Tab: Grafik Kab/Kota */}' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    print('\n'.join(lines[end_idx-15:end_idx]))
else:
    print("Not found")
