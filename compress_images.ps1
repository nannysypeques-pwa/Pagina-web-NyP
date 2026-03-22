Add-Type -AssemblyName System.Drawing

function Compress-Image {
    param(
        [string]$Path,
        [int]$Quality = 75
    )
    
    try {
        $img = [System.Drawing.Image]::FromFile($Path)
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" -or $_.FormatDescription -eq "PNG" } | Select-Object -First 1
        
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
        
        $tempPath = $Path + ".tmp"
        $img.Save($tempPath, $encoder, $encoderParams)
        $img.Dispose()
        
        if ((Get-Item $tempPath).Length -lt (Get-Item $Path).Length) {
            Move-Item $tempPath $Path -Force
            Write-Host "Compressed: $Path"
        } else {
            Remove-Item $tempPath
            Write-Host "Skipped (no size gain): $Path"
        }
    } catch {
        Write-Error "Failed to compress ${Path}: $_"
    }
}

$imageFiles = Get-ChildItem -Path "c:\Proyectos\pagina web nannys y peques\img" -Recurse -Include *.jpg, *.jpeg | Where-Object { $_.Length -gt 100KB }

foreach ($file in $imageFiles) {
    Compress-Image -Path $file.FullName
}
