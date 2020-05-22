# Azure Devops SCCM Task

SCCM Task is an Azure DevOps extension that allow to create package and deployment to SCCM.
This extension cannot work on Microsoft Hosted Agents!

## Package Support
* APPX
* MSI (Planned)

## Installation

This extension is currently in development and not yet available on marketplace. Once first working version will be ready it will be released.

## Usage

This task required service connection named SCCM Service Connection to specify
* Hostname: Hostname of SCCM Server
* username: Username of account SCCM authorized to do remote powershell and access to SCCM
* password: Password of service account

In addition, you need to configure CredSSP on between azureDevOps Agent Machine and your SCCM Server to be able to forward credential to shared DFS if required.

### CredSSP Configuration

As SCCM only accept UNC Path to package to deploy, this mean as we use remote powershell for task CredSSP need to be setup.
Here is some links to help you for setup credSSP:
https://codingbee.net/powershell/powershell-use-credssp-to-run-commands-remotely-with-fewer-issues
https://www.ravichaganti.com/blog/powershell-2-0-remoting-guide-part-12-%e2%80%93-using-credssp-for-multi-hop-authentication/

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## RoadMap

First version will offer basics usage of SCCM Package deployment, next version will be more configurable to handle all configuration cases.

## License
[MIT](https://choosealicense.com/licenses/mit/)