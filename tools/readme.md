# How to use the tools

Install dependencies:
```npm install```

# Run the server
Need a local server because you can't do ajax requests locally (properly).
```npm start```

# "Split" - Splits the tips.html file into smaller files per hero
This file was used to split tips.html into separate hero files. It's a one-use
thing so it's quite agricultural. I imported it into vcs so people could see how
it was done. 

**WARNING: Would not recommend using this as it will overwrite all tip files** 
    
```cd {path_to_project_root}/tools```

```node ./split.js```

# "Inline Images" - Inlines hero profile images
This is used to inline the hero profile images. If you'd like to change/update a 
profile image just change the data-uri to the path of the file you'd like to be 
in-lined and boom! It does it!
    
```cd {path_to_project_root}/tools```

```node ./inline-images.js```