## Philosophy
The main goal of the current project is to control home kits in the local network without using any manufacturers services.
But, some of the devices not supported any API to control it in an offline network, for this case the IFTTT service is great.
It can allow control of any device that his manufacturer support Ifttt services.

> Note, this is not an Ifttt integration for the whole project. 
In the future, the project integration will allow to turn on/off any device by any Ifttt trigger and to trigger by minion on/off event. see [#11](/../../issues/11). 

## Implementation
Currently, the implementation of Ifttt interface is using Ifttt [WebHooks](https://ifttt.com/maker_webhooks).
because implementing of Ifttt service require main host that received Ifttt API calls,
but this project made to be totally in users hands and control. so using webhooks is the best option for it.

## Step by step instructions
