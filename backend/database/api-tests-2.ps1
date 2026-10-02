$base = 'http://localhost:5000/api'

function Call($method, $path, $body, $token) {
  $h = @{}
  if ($token) { $h['Authorization'] = "Bearer $token" }
  try {
    $p = @{ Uri = "$base$path"; Method = $method; Headers = $h; UseBasicParsing = $true }
    if ($body) { $p.Body = ($body | ConvertTo-Json); $p.ContentType = 'application/json' }
    $r = Invoke-WebRequest @p
    return @{ status = [int]$r.StatusCode; body = ($r.Content | ConvertFrom-Json) }
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    return @{ status = $code; body = $null }
  }
}

function Check($name, $ok) {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green }
  else { Write-Host "FAIL  $name" -ForegroundColor Red }
}

# Copies a hashtable and replaces some values
function With($original, $changes) {
  $copy = @{}
  foreach ($k in $original.Keys) { $copy[$k] = $original[$k] }
  foreach ($k in $changes.Keys) { $copy[$k] = $changes[$k] }
  return $copy
}

$admin = (Call 'Post' '/auth/login' @{ email = 'admin@roxiler.com'; password = 'Admin@1234' }).body.data.token
$good = @{ name = 'Validation Test Account Name'; email = 'val.test@example.com'; address = 'Bhopal'; password = 'Valid@1234' }

Check 'Register: short name rejected (400)' ((Call 'Post' '/auth/register' (With $good @{ name = 'Short' })).status -eq 400)
Check 'Register: name over 60 chars rejected (400)' ((Call 'Post' '/auth/register' (With $good @{ name = ('A' * 61) })).status -eq 400)
Check 'Register: weak password rejected (400)' ((Call 'Post' '/auth/register' (With $good @{ password = 'weakpass' })).status -eq 400)
Check 'Register: invalid email rejected (400)' ((Call 'Post' '/auth/register' (With $good @{ email = 'not-an-email' })).status -eq 400)
Check 'Register: duplicate email rejected (409)' ((Call 'Post' '/auth/register' (With $good @{ email = 'rahul@example.com' })).status -eq 409)
Check 'Admin add user: address over 400 chars rejected (400)' ((Call 'Post' '/admin/users' (With $good @{ address = ('a' * 401); role = 'USER' }) $admin).status -eq 400)
