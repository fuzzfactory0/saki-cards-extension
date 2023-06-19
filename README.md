# Saki Cards Extension

Chrome extension for playing Saki Mahjong Cards in Autotable (autotable.riichi.moe)

Original game by Anton00, KlorofinMaster & DramaTheurgist

### Content
1. [How to use](#how-to-use)
2. [Installation](#installation)
3. [Updating](#updating)
4. [Contact](#contact)

## How to use

Create or join a Saki Cards room only **after** joining or creating an Autotable game, when you're already seated at the table.  

The room admin can rearrange the positions of players by clicking the "Arrange seats" button. This will let them move the players around to match the positions from their own point of view.

<img src="https://i.imgur.com/Ax6cYMw.png">

Playing the game is as simple as it gets: Draw however many cards you need at the start of the game, select the card you want to play, and after the room admin reveals everyone's card, you start playing Saki mahjong! 

When hovering over one of your cards, pressing the green button will play that card, while the red button will shuffle it back to the deck. Both buttons have tooltips so you don't forget ;)

<img src="https://i.imgur.com/q8oegto.png">

If you're having trouble reading your opponents' cards or your own cards, by pressing the shift key while hovering over a card you can zoom in to see it bigger.

<img src="https://i.imgur.com/emoP5zc.jpg" height=500>

While everyone is picking their card, they will be showing facedown for everyone else (and your own will be greyed out). Don't hesitate to change it for a different one if you changed your mind! 

<img src="https://i.imgur.com/DNoim1Y.jpg" height=500>

Once everyone is ready, the room admin will reveal the cards (use the "Reveal" button on the right if you're the admin) and the game will begin. Nobody is able to change their card past this point! 

<img src="https://i.imgur.com/blboZTr.jpg" height=500>

To get the cards out of the way, you can either use the "Toggle UI" or the "Hide cards" buttons.

**Toggle UI:**

<img src="https://i.imgur.com/PamOPnf.jpg" height=500>

Once the round is done (Tip: the "Hide cards" button will clear your view for making payments), the room admin will hit the "New round" button: everyone's cards will go back to their hands, and it's back to the beginning.

## Installation 

### The new easy way

1. Download the extension from its [Chrome Web Store page](https://chrome.google.com/webstore/detail/saki-cards-for-autotable/eebhgnhgjddpmagdidepnfaelledhagp)
2. You still need to do [this step though](#config-your-browser-so-its-able-to-reach-the-saki-cards-server) 
3. That's it

### The old way (why would you ever want to do this again)
1. Download the source code ([from here](https://github.com/fuzzfactory0/saki-cards-extension/releases))
2. Extract the zip in any folder you want. Be aware that the code will need to stay there forever.
3. Go to the [extensions page on Google Chrome](chrome://extensions/)
4. Activate developer mode by hitting the switch in the upper right corner
5. New options have appeared at the top left: Click the "Load Unpacked" button

<img src="https://i.imgur.com/iYzFZ9X.png">
6. Select the folder where you extracted the zip (the folder that contains the "manifest.json" file). You should now be able to see the extension loaded into your browser:

<img src="https://i.imgur.com/0pnczl7.png">

### Config your browser so it's able to reach the Saki Cards server
1. Go to [Autotable](https://autotable.riichi.moe/)
2. Click the padlock next to the URL and go to Site Settings

<img src="https://i.imgur.com/53H5ewd.png">
3. Scroll down until you see the "Insecure content" option, then in the dropdown select Allow

<img src="https://i.imgur.com/9nzippg.png">

4. Reload autotable and you're ready to go!

### Why do all this? Why should I allow insecure content in the autotable website?
**In short:** Don't worry, this isn't really insecure (ironically), it's just so the extension can reach the server, which doesn't have a secure certificate.  

**Long story:** The extension needs to communicate with a remote server which handles the rooms and the game flow, hosted in the Amazon Web Services cloud. Now, acquiring and setting up SSL certificates is a pain (so is registering an extension in the chrome web store, that's why you're installing it manually), so the extension communicates with the server through the regular HTTP protocol instead of HTTPS. Since autotable.riichi.moe is a secure website, Chrome doesn't like the fact that a secure website which was loaded through HTTPS is sending random HTTP requests, so the browser blocks those "mixed protocol requests" automatically by default. By allowing insecure content to reach that particular website, you're telling Chrome to ignore the fact that the extension is using a different protocol, and this is essential for the game to work.

## Updating

If you installed the extension from the web store, you don't need to do anything. It's automatic.

Otherwise, to update the extension to a new version, simply download the new version and replace the old files with the new. Then, either restart Chrome, or go to the extensions page, and click the reload button on the bottom right corner of the extension. 

<img src="https://i.imgur.com/0pnczl7.png">

## Contact

Please forward any questions, suggestions, feedback, complaints or litigations to @Fuzz#7915 on Discord. 
