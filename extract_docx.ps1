Add-Type -AssemblyName System.IO.Compression.FileSystem
$docxPath = "C:\Proyectos\pagina web nannys y peques\Manual_de_Ventas_Nannys_y_Peques.docx"
$tempPath = "C:\Proyectos\pagina web nannys y peques\temp_docx"
if (Test-Path $tempPath) { Remove-Item -Recurse -Force $tempPath }
[System.IO.Compression.ZipFile]::ExtractToDirectory($docxPath, $tempPath)
[xml]$xml = Get-Content "$tempPath\word\document.xml"
$paragraphs = $xml.SelectNodes("//*[local-name()='p']")
$result = @()
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//*[local-name()='t']") | ForEach-Object { $_.InnerText }
    if ($texts) { $result += ($texts -join "") }
}
$result | Out-File -FilePath "C:\Proyectos\pagina web nannys y peques\manual_extracted.txt" -Encoding utf8
Remove-Item -Recurse -Force $tempPath
