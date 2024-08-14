param(
    [int]$NumberOfVideos = 5,
    [string]$OutputDirectory = (Join-Path $PSScriptRoot "../../sample")
)

if (!(Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    throw "need to install ffmpeg."
}

function Get-RandomColor {
    $r = Get-Random -Minimum 0 -Maximum 256
    $g = Get-Random -Minimum 0 -Maximum 256
    $b = Get-Random -Minimum 0 -Maximum 256
    return "0x{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
}

function Get-RandomDuration {
    return Get-Random -Minimum 5 -Maximum 30
}

$videos = @()

for ($i = 1; $i -le $NumberOfVideos; $i++) {
    $color = Get-RandomColor
    $duration = Get-RandomDuration
    $outputFile = Join-Path $OutputDirectory "samplevideo_$($i.ToString("000"))_$($color)_$($duration)sec.mp4"

    # generate a solid color frame video
    ffmpeg -f lavfi -i color=c=$($color):s=1280x720:d=$duration -c:v libx264 -pix_fmt yuv420p $outputFile -y

    $videos += Get-Item $outputFile
}

Write-Host "Completed: $NumberOfVideos videos have been generated."
return $videos
