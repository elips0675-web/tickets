param([switch]$Json)

$info = [PSCustomObject]@{
  computerName = $env:COMPUTERNAME
  userName     = "$env:USERDOMAIN\$env:USERNAME"
  domain       = $env:USERDOMAIN
  loginName    = $env:USERNAME
  os           = (Get-CimInstance Win32_OperatingSystem).Caption
  arch         = $env:PROCESSOR_ARCHITECTURE
}

if ($Json) {
  $info | ConvertTo-Json -Compress
} else {
  Write-Host "=== System Info ===" -ForegroundColor Cyan
  Write-Host "Computer name : $($info.computerName)"
  Write-Host "Account       : $($info.userName)"
  Write-Host "Domain        : $($info.domain)"
  Write-Host "OS            : $($info.os)"
  Write-Host "Architecture  : $($info.arch)"
}
