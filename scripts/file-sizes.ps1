param([Parameter(Mandatory=$true,ValueFromRemainingArguments=$true)][string[]]$Paths)
foreach ($p in $Paths) {
  $f = Get-Item -LiteralPath $p -ErrorAction SilentlyContinue
  if ($null -eq $f) { Write-Host ("MISSING " + $p); continue }
  $kb = [math]::Round($f.Length / 1024, 2)
  Write-Host ("{0,-60} {1,10} bytes  {2,8} KB" -f $f.FullName, $f.Length, $kb)
}
