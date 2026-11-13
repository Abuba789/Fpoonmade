$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$encoding = [Text.UTF8Encoding]::new($false)
$game = [IO.File]::ReadAllText((Join-Path $root 'game.js'))
$test = [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'quiz-browser.js'))
$end = $game.LastIndexOf('})();')
if ($end -lt 0) { throw 'Game closure not found' }
$testGame = Join-Path $PSScriptRoot 'quiz-game.generated.js'
$testHtml = Join-Path $PSScriptRoot 'quiz.generated.html'
try {
  [IO.File]::WriteAllText($testGame,$game.Insert($end,$test),$encoding)
  $html = [IO.File]::ReadAllText((Join-Path $root 'index.html'))
  $html = $html.Replace('<head>','<head><base href="../">')
  $html = $html.Replace('src="game.js"','src="tests/quiz-game.generated.js"')
  [IO.File]::WriteAllText($testHtml,$html,$encoding)
  $chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
  $url = [Uri]::new($testHtml).AbsoluteUri
  $profile = Join-Path ([IO.Path]::GetTempPath()) 'sanity-network-quiz-tests'
  $output = & $chrome --headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage "--user-data-dir=$profile" --virtual-time-budget=15000 --dump-dom $url 2>$null
  $dom = $output -join "`n"
  if ($dom -match '(?s)<pre id="test-results">(.*?)</pre>') { [Net.WebUtility]::HtmlDecode($Matches[1]) }
  if ($dom -notmatch 'data-quiz-tests="passed"') { throw 'Browser quiz tests failed or did not finish' }
} finally {
  Remove-Item -LiteralPath $testGame,$testHtml -ErrorAction SilentlyContinue
}
