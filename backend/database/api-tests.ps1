$base = 'http://localhost:5000/api'

function Call($method, $path, $body, $token) {
  $h = @{}
  if ($token) { $h['Authorization'] = "Bearer $token" }
  try {
    $p = @{ Uri = "$base$path"; Method = $method; Headers = $h; UseBasicParsing = $true }
    if ($body) { $p.Body = ($body | ConvertTo-Json); $p.ContentType = 'application/json' }
    $r = Invoke-WebRequest @p
    return @{ status = [int]$r.StatusCode; body = ($r.Content | ConvertFrom-Json); raw = $r.Content }
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    $msg = $null
    if ($_.ErrorDetails.Message) { try { $msg = $_.ErrorDetails.Message | ConvertFrom-Json } catch {} }
    return @{ status = $code; body = $msg; raw = '' }
  }
}

function Check($name, $ok) {
  if ($ok) { Write-Host "PASS  $name" -ForegroundColor Green }
  else { Write-Host "FAIL  $name" -ForegroundColor Red }
}

$admin = (Call 'Post' '/auth/login' @{ email = 'admin@roxiler.com'; password = 'Admin@1234' }).body.data.token
$user  = (Call 'Post' '/auth/login' @{ email = 'rahul@example.com'; password = 'Demo@1234' }).body.data.token
$owner = (Call 'Post' '/auth/login' @{ email = 'owner.green@example.com'; password = 'Owner@1234' }).body.data.token
Check 'Logins for admin, user and owner work' ($admin -and $user -and $owner)

$okAddr = 'Bhopal'
$good = @{ name = 'Validation Test Account Name'; email = 'val.test@example.com'; address = $okAddr; password = 'Valid@1234' }

# Validation
Check 'Register: short name rejected (400)' ((Call 'Post' '/auth/register' ($good + @{ name = 'Short' })).status -eq 400)
Check 'Register: name over 60 chars rejected (400)' ((Call 'Post' '/auth/register' ($good + @{ name = ('A' * 61) })).status -eq 400)
Check 'Register: weak password rejected (400)' ((Call 'Post' '/auth/register' ($good + @{ password = 'weakpass' })).status -eq 400)
Check 'Register: invalid email rejected (400)' ((Call 'Post' '/auth/register' ($good + @{ email = 'not-an-email' })).status -eq 400)
Check 'Register: duplicate email rejected (409)' ((Call 'Post' '/auth/register' ($good + @{ email = 'rahul@example.com' })).status -eq 409)
Check 'Admin add user: address over 400 chars rejected (400)' ((Call 'Post' '/admin/users' ($good + @{ address = ('a' * 401); role = 'USER' }) $admin).status -eq 400)
Check 'Admin add user: invalid role rejected (400)' ((Call 'Post' '/admin/users' ($good + @{ role = 'HACKER' }) $admin).status -eq 400)

# Authentication and authorization
Check 'Login: wrong password rejected (401)' ((Call 'Post' '/auth/login' @{ email = 'admin@roxiler.com'; password = 'Wrong@1234' }).status -eq 401)
Check 'No token on admin API rejected (401)' ((Call 'Get' '/admin/dashboard').status -eq 401)
Check 'User token on admin API blocked (403)' ((Call 'Get' '/admin/dashboard' $null $user).status -eq 403)
Check 'Owner token on admin API blocked (403)' ((Call 'Get' '/admin/dashboard' $null $owner).status -eq 403)
Check 'Admin token on user stores API blocked (403)' ((Call 'Get' '/stores' $null $admin).status -eq 403)
Check 'User token on owner dashboard blocked (403)' ((Call 'Get' '/owner/dashboard' $null $user).status -eq 403)

# Ratings
Check 'Rating 0 rejected (400)' ((Call 'Put' '/stores/2/ratings' @{ rating = 0 } $user).status -eq 400)
Check 'Rating 6 rejected (400)' ((Call 'Put' '/stores/2/ratings' @{ rating = 6 } $user).status -eq 400)
Check 'Rating 3.5 rejected (400)' ((Call 'Put' '/stores/2/ratings' @{ rating = 3.5 } $user).status -eq 400)
Check 'Duplicate rating (POST twice) rejected (409)' ((Call 'Post' '/stores/2/ratings' @{ rating = 4 } $user).status -eq 409)

# Data and security
$ownerDash = Call 'Get' '/owner/dashboard' $null $owner
Check 'Owner sees only own store (Green Valley, 3 ratings)' ($ownerDash.status -eq 200 -and $ownerDash.body.data.store.totalRatings -eq 3)
$usersList = Call 'Get' '/admin/users' $null $admin
Check 'Password hash never appears in the users list' ($usersList.status -eq 200 -and $usersList.raw -notmatch 'password')
Check 'Bad role filter rejected (400)' ((Call 'Get' '/admin/users?role=HACKER' $null $admin).status -eq 400)
Check 'SQL-injection style sortBy is ignored safely (200)' ((Call 'Get' '/admin/users?sortBy=name;DROP' $null $admin).status -eq 200)
