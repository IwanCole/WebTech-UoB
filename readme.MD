# COMS32500 Web Technologies
#### University of Bristol


Small website created to demonstrate various web technologies for a piece of coursework. The "Paw Pals" site includes:
 - Cookies
 - Chat over WebSockets
 - RESTful methods
 - Session authentication
 - Fluid CSS3 animations
 - SQLite3 Database access
 - 3rd Party API calls
 - Thorough server-side validation



## Examples from the site
#### User signup animation
<img src="https://github.com/IwanCole/WebTech-UoB/blob/master/readme_images/signup.gif" width="550"> 

#### Theme switching
<img src="https://github.com/IwanCole/WebTech-UoB/blob/master/readme_images/theme.gif" width="550">

#### Asking the server for a joke
<img src="https://github.com/IwanCole/WebTech-UoB/blob/master/readme_images/joke.gif" width="550">



##### See the report for technical and implementation details



### Setup
Clone the repo, and use NPM to install dependencies via
```
> npm install
```
And then run the server with a clean database using 
```
> npm run-script clean
```
Access the website by navigating to ```http://127.0.0.1:8080/```. Once logged in, you can visit your personal profile page by going to ```127.0.0.1:8080/me```. On doing this, the server validates your session cookies to determine the correct profile id to use, and will then redirect you to an address similar to ```127.0.0.1:8080/profile?id=010469760```.


------