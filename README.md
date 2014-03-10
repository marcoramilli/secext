Firefox Security Extension
============

### The Scientific Papers.

[Original Website](http://deisnet.deis.unibo.it/nsl/securext/hs_res.php)

[Splitting the HTTPS Stream to Attack Secure Web Connections:](http://ieeexplore.ieee.org/Xplore/login.jsp?url=http%3A%2F%2Fieeexplore.ieee.org%2Fiel5%2F8013%2F5655229%2F05655249.pdf%3Farnumber%3D5655249&authDecision=-203)

[Man-in-the-Middle Attack to the HTTPS Protocol:](http://ieeexplore.ieee.org/Xplore/login.jsp?url=http%3A%2F%2Fieeexplore.ieee.org%2Fiel5%2F8013%2F4768640%2F04768661.pdf%3Farnumber%3D4768661&authDecision=-203)

[Frightened by Links:](http://portal.acm.org/citation.cfm?id=1685894)

### The Problem.

 With the growth of the World Wide Web, and with the ever increasing presence of services for user and its sensitive data, increases the need for security aimed at protection of networked communication. This leads to the need for secure communications and transactions, the authenticity dialogue and Privacy Policy. Here enters the HTTPS protocol, which allows a browser to verify the authenticity of a web server and to establish an encrypted channel for protection of data exchanged.

Right now, this development leads to more and more web pages full of items and functions, in fact they are no longer a monolithic entity, but include a collection components, including images, videos, CSS, that provide guidelines presentation and many other embedded media. There are therefore several data streams, independent of each other between web servers and browsers.

There are many approaches to maintain integrity and privacy of each data flow; ideally, is assumed that there is a valid digital certificate that starts the TLS connection and then guarantee that any content on the page in question is protected by HTTPS. This protocol is used, for example, for the exchange of important data through a form, and also for secondary components such as images, banner advertising and other things.

Often a hybrid approach is adopted by web administrators. They choose to not protect the entire page, but only a part, because most of the data does not need the cryptographic protection but also because there is a waste of expensive resources for the web server. So the choice of saving resources leads to adopt the HTTPS protocol only where absolutely necessary.

Also, the certificate plays an important role, in fact it could be not reliable for the browser, so invalid according to its maturity or because it is self-signed. A situation like this generates warnings that only the users can manage, in most cases, because their listlessness, they will be ignored; at this point the users can only trust the "security seals" placed within the page, like favicons.

These different scenarios open the way for targeted attacks, such as famous MiTM (Man In The Middle).

This type of attack is to hijack the traffic generated during the communication between two hosts to a third host, the attacker. The latter is then able to read, enter or modify at will messages between two parties, making it appear to both endpoints of the communication that he is in fact their legitimate interlocutor. All this happens thanks to ARP-spoofing techniques, which have the task of modifying the ARP Cache of each host in the target subnet.

As mentioned before, the vulnerability that we are going to exploit with this attack comes from a single decision by those who administer the web server: to serve the first (and probably the most popular) page of the website through the HTTP protocol in order to reduce processing TLS on the server. If you experienced such a situation then, the resource to which access will certainly allow an encrypted connection, but not immediately. In this case, a skilled attacker can use tools like sslstrip during his attack, which has the function to edit an HTML page, replacing each HTTPS link with HTTP links. In this scenario then, only the communication between the victim and the attacker will be modified, while remaining unchanged in the channel between the attacker and the web server. In this way the attacker will able to "sniff" the credentials entered by the victim. 

![alt text](http://deisnet.deis.unibo.it/nsl/securext/images/hs_sslstrip.jpg "HTTPS Stripping")

### The Solution.

 Let's look at a solution to the problem by the use of Firefox Extensions. Analyzing the problem mentioned before, all this suggests the need for browser-side control that is able to intercept this type of situation. As mentioned above, a tool like sslstrip edits the HTML source, so the smartest thing to do is to check if the page which is accessed has changed.

The idea is very simple. It consist to measure the integrity of an HTML page by computing an hash with the MD5 algorithm; so the extension needs have available a table of hash functions of trusted pages for given web addresses, such as online banking site and other services, that use obviously the HTTPS protocol and are therefore consistent with the scenario described above.

When a page from that address is loaded, its integrity is checked against the database of trusted hash functions. More precisely in this case the Firefox extension extrapolates the HTML source, it calculates an MD5 hash and compare this in the database. If the two results are different means that the page was modified, and then there will be chances of an attack.

The trusted sample is the hash of the page loaded calculated when the page was loaded from a network environment the user trusts, or received from some another user that we trust and that had the chance to upload the page in a trusted network.

The HTTPS Stripping attack requires a Man In The Middle attack.

The extension works in two phases:
- "DB Population": creates a database of selected pages at risk of threats and their calculation of hash functions;
- "Page Evaluation": compares the hash function of the currently uploaded page with the corresponding value in the DB during the browsing. 

![alt text](http://deisnet.deis.unibo.it/nsl/securext/images/hs_scheme.jpg "My solution")


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/marcoramilli/secext/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

