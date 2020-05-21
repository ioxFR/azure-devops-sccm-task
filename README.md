# Azure Devops SCCM Task

SCCM Task is an Azure DevOps extension that allow to create package and deployment to SCCM.

## Installation

This extension is currently in development and not yet available on marketplace. Once first working version will be ready it will be released.

## Usage

This task required service connection named SCCM Service Connection to specify
* Hostname: Hostname of SCCM Server
* username: Username of account SCCM authorized to do remote powershell and access to SCCM
* password: Password of service account

In addition, you need to configure CredSSP on between azureDevOps Agent Machine and your SCCM Server to be able to forward credential to shared DFS if required.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)