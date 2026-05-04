import os, re

dir_path = r'c:\BBPMP\pmp-dashboard\app\dashboard-provinsi\components\grafik-kabkot'
files = ['2024.tsx', '2025.tsx']

for file in files:
    filepath = os.path.join(dir_path, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace INDIKATOR_LIST.includes(d.indikator)
    content = content.replace('INDIKATOR_LIST.includes(d.indikator)', 'Object.keys(INDIKATOR_MAP).includes(d.indikator)')

    # Replace kabMap assignment safely by finding the substring
    if 'if (!(r.indikator in kabMap[r.kab_kota])) {' in content:
        old_str = 'if (!(r.indikator in kabMap[r.kab_kota])) {\n        kabMap[r.kab_kota][r.indikator] = r.nilai;\n      }'
        new_str = 'const mappedInd = INDIKATOR_MAP[r.indikator];\n      if (mappedInd && !(mappedInd in kabMap[r.kab_kota])) {\n        kabMap[r.kab_kota][mappedInd] = r.nilai;\n      }'
        content = content.replace(old_str, new_str)
        
    # Check if INDIKATOR_MAP is already in the file
    if 'const INDIKATOR_MAP' not in content:
        # replace INDIKATOR_LIST array and INDIKATOR_COLORS
        content = re.sub(r'const INDIKATOR_LIST = \[[^\]]+\];', '', content)
            
        old_colors = '''const INDIKATOR_COLORS: Record<string, string> = {
  "A.1": "#3b82f6",
  "A.2": "#6366f1",
  "A.3": "#8b5cf6",
  "D.1": "#10b981",
  "D.3": "#14b8a6",
  "D.4": "#f59e0b",
  "D.8": "#ef4444",
  "D.10": "#f97316",
};'''
        new_constants = '''const INDIKATOR_MAP: Record<string, string> = {
  "A.1": "A.1(Kemampuan Literasi)",
  "A.2": "A.2(Kemampuan Numerasi)",
  "A.3": "A.3(Karakter)",
  "D.1": "D.1(Kualitas Pembelajaran)",
  "D.3": "D.3(Kepemimpinan Instruksional)",
  "D.4": "D.4(Iklim Keamanan Satuan Pendidikan)",
  "D.8": "D.8(Iklim Kebinekaan)",
  "D.10": "D.10(Iklim Inklusiv)",
};

const INDIKATOR_LIST = Object.values(INDIKATOR_MAP);

const INDIKATOR_COLORS: Record<string, string> = {
  "A.1(Kemampuan Literasi)": "#3b82f6",
  "A.2(Kemampuan Numerasi)": "#6366f1",
  "A.3(Karakter)": "#8b5cf6",
  "D.1(Kualitas Pembelajaran)": "#10b981",
  "D.3(Kepemimpinan Instruksional)": "#14b8a6",
  "D.4(Iklim Keamanan Satuan Pendidikan)": "#f59e0b",
  "D.8(Iklim Kebinekaan)": "#ef4444",
  "D.10(Iklim Inklusiv)": "#f97316",
};'''
        if old_colors in content:
            content = content.replace(old_colors, new_constants)
        else:
            print('could not find colors in', file)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
