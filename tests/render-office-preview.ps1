# Replays the real canvas renderer for an inspectable PNG when headless Chromium is unavailable.
param([string]$Output='docs/corporate-office-preview.png')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=Split-Path $PSScriptRoot -Parent
$data=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'office-preview.generated.json') -Raw | ConvertFrom-Json
$images=@{}
function Get-Color([string]$value){
  if($value.StartsWith('rgba')){
    $parts=$value.Substring(5).TrimEnd(')').Split(',')
    return [Drawing.Color]::FromArgb([int]([double]$parts[3]*255),[int]$parts[0],[int]$parts[1],[int]$parts[2])
  }
  return [Drawing.ColorTranslator]::FromHtml($value)
}
$result=[Drawing.Bitmap]::new(1740,1120)
$outputGraphics=[Drawing.Graphics]::FromImage($result)
$outputGraphics.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$outputGraphics.PixelOffsetMode=[Drawing.Drawing2D.PixelOffsetMode]::Half
try {
  foreach($layer in $data.layers){
    $bitmap=[Drawing.Bitmap]::new([int]$layer.width,[int]$layer.height)
    $g=[Drawing.Graphics]::FromImage($bitmap)
    $g.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.PixelOffsetMode=[Drawing.Drawing2D.PixelOffsetMode]::Half
    $g.TextRenderingHint=[Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit
    $states=[Collections.Generic.Stack[Drawing.Drawing2D.GraphicsState]]::new()
    $clipRect=$null
    foreach($cmd in $layer.commands){
      $a=$cmd.args
      switch($cmd.op){
        'save' {$states.Push($g.Save())}
        'restore' {$g.Restore($states.Pop())}
        'scale' {$g.ScaleTransform([single]$a[0],[single]$a[1])}
        'translate' {$g.TranslateTransform([single]$a[0],[single]$a[1])}
        'rotate' {$g.RotateTransform([single]([double]$a[0]*180/[Math]::PI))}
        'rect' {$clipRect=[Drawing.RectangleF]::new([single]$a[0],[single]$a[1],[single]$a[2],[single]$a[3])}
        'clip' {$g.SetClip($clipRect,[Drawing.Drawing2D.CombineMode]::Intersect)}
        'fillRect' {
          $brush=[Drawing.SolidBrush]::new((Get-Color $cmd.fill))
          $g.FillRectangle($brush,[single]$a[0],[single]$a[1],[single]$a[2],[single]$a[3]);$brush.Dispose()
        }
        'strokeRect' {
          $pen=[Drawing.Pen]::new((Get-Color $cmd.stroke),[single]$cmd.width)
          $g.DrawRectangle($pen,[single]$a[0],[single]$a[1],[single]$a[2],[single]$a[3]);$pen.Dispose()
        }
        'fillText' {
          $size=9;if($cmd.font -match '(\d+)px'){$size=[int]$Matches[1]}
          $font=[Drawing.Font]::new('Consolas',[single]$size,[Drawing.FontStyle]::Regular,[Drawing.GraphicsUnit]::Pixel)
          $brush=[Drawing.SolidBrush]::new((Get-Color $cmd.fill))
          $g.DrawString([string]$a[0],$font,$brush,[single]$a[1],[single]([double]$a[2]-$size));$font.Dispose();$brush.Dispose()
        }
        'drawImage' {
          $key=[string]$a[0]
          if(!$images.ContainsKey($key)){$images[$key]=[Drawing.Bitmap]::new((Join-Path $root $key))}
          $rect=[Drawing.RectangleF]::new([single]$a[5],[single]$a[6],[single]$a[7],[single]$a[8])
          $sourceRect=[Drawing.RectangleF]::new([single]$a[1],[single]$a[2],[single]$a[3],[single]$a[4])
          $g.DrawImage($images[$key],$rect,$sourceRect,[Drawing.GraphicsUnit]::Pixel)
        }
      }
    }
    $g.Dispose()
    $outputGraphics.DrawImage($bitmap,[Drawing.Rectangle]::new(0,0,1740,1120))
    $bitmap.Dispose()
  }
  $destination=Join-Path $root $Output
  [IO.Directory]::CreateDirectory((Split-Path $destination -Parent)) | Out-Null
  $result.Save($destination,[Drawing.Imaging.ImageFormat]::Png)
  $destination
} finally {
  $outputGraphics.Dispose();$result.Dispose()
  foreach($image in $images.Values){$image.Dispose()}
}
