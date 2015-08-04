<b>NeighborhoodMap</b>

The webpage is divided into two tabs

1. Tab-1 shows a Map and Markers that get added onto it.
2. Tab-2 will show a carded representation of the Markers and the info which pops up on the Info windows.
3. Cards also have a link which navigates to the wikipedia entry for the place that the marker represents
4. Map Markers have InfoWindows that pull summaries from Wikipedia
5. Map Markers can be added with the i/p field in the navigation or the hidden drawer.
6. Map markers will display icons that best represent the location.
7. Map markers can be searched and filtered using the search field in the navigation bar or drawer.
8. Map markers can be toggled on and off using a toggle in the drawer or navigation bar
9. The application detects when the user loses connectivity to show an offline message

<b>How to run the application?</b>

The application can be run just by opening the index.html file OR more correctly as follows...

This is a nodejs application which can be run as follows
1. Install node and npm if you haven't already
    Follow the guide here...
    https://nodejs.org/
2. run "npm install"
3. run "node server/server.js"
4. Access the application at "http://localhost:3010"

<b>Building the application</b>

1. The application includes a gulp file which can be run through the npm gulp module.
  1.1 If you do not have gulp installed, follow this link
  https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md
  
2. Gulp will minify and merge all javascript files into "all.min.js" which is actually used in the application
3. It also watches changes to the "server/source/js/" folder to pick up changes and automatically provide 
    these to the client
    
<b>How the application was built and structured?</b>

1. I used Google's material design lite library for responsiveness and some smashing good material look :-)
2. The javascript code is structured as follows
    1. Knockout acts as the MVVM framework
    2. I added functions which represent a Map, Marker and finally one that provides all the bindings through Knockout.
    3. For detailed code structure and implementation details, please see code comments.
    
<b>Optimizations</b>
Added optimizations to the application so the pagespeed scores look good.
