---
layout: default
title: Windows Cheatsheet
parent: Cheatsheets
---

# Windows Cheat Sheet

## Create Port Listener

```powershell
$portNumber = 1433 # Set your desired port here
$durationInSeconds = 3600 # Set your desired time here
$ruleName = "TempRuleForPort$portNumber"

try {
    # Add firewall rule
    Write-Host "Adding firewall rule..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $portNumber -Action Allow -Protocol TCP

    Write-Host "Starting listener on port $portNumber..." -ForegroundColor Yellow
    $listener = [System.Net.Sockets.TcpListener]$portNumber
    $listener.Start()

    $endTime = (Get-Date).AddSeconds($durationInSeconds)

    while ((Get-Date) -lt $endTime)
    {
        if ($listener.Pending())
        {
            $client = $listener.AcceptTcpClient()
            Write-Host ("Received connection from {0}" -f $client.Client.RemoteEndPoint) -ForegroundColor Green
            $client.Close()
        }
        Start-Sleep -Seconds 1
    }

    Write-Host "Stopping listener..." -ForegroundColor Yellow
    $listener.Stop()
}
catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
}
finally {
    # Ensure the listener is stopped
    if ($listener) {
        $listener.Stop()
    }

    # Remove firewall rule
    Write-Host "Removing firewall rule..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName $ruleName
}

# Close the PowerShell session
exit
```
Source: `{{ page.path }}`
