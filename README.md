# ENLIL

Deployed site: https://enlil.swx-trec.com

This is a frontend visualizing the ENLIL 3d model.

## Contacts

* **Product Owner:**
	Greg Lucas, greg.lucas@lasp.colorado.edu
* **Experienced Devs:**
    Front end: Jennifer Knuth, jennifer.knuth@lasp.colorado.edu
	Back end: Greg Lucas, greg.lucase@lasp.coloardo.edu

## Relevant JIRA Project(s)

* [SWT](http://mods-jira.lasp.colorado.edu:8080/browse/SWT/): Main project for the
	Space Weather Model Staging Platform codebase.

## Related Projects

NA

## Production URLs

https://enlil.swx-trec.com

## Necessary Permissions

Access to AWS S3 console is currently required to deploy.

## Architecture

This is a visualizer for the ENLIL 3d model built with Angular.

## Running ENLIL Locally

See 'Development server' below.

### Project Dependencies

A backend with the ENLIL paraview server is required.

`npm run start:prod` will use the production backend deployed to AWS.

To test with a local paraview server, follow the README instructions in the enlil-3d-server repo https://github.com/SWxTREC/enlil-3d-server for running a local docker container containing the backend and some relevant data.

### Development server

Run `npm start` for a frontend dev server (use `npm run start:prod` to connect to the deployed AWS backend). Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Local build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Run `npm run build:prod` for a production build.

### Linting

Run `npm run lint` to lint your code, or run `npm run lint:watch` to automatically lint every time you change a file.

Automatically fix many linter warnings by running `npm run lint:fix`.

### Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Running a dev image locally

Once you have built your image using the command above, you can `./docker-run.sh` to start a local development image. This image will be served at `http://localhost:8080/dev`

To stop your image run `docker stop {{Project-name}}`

Cleaning up old images is also a good idea from time to time. To clean up your unused docker resources run `docker system prune`

### Pushing an image to the LASP web registry

When you are ready to push your image, contact the web team infrastructure group for credentials and instructions on how to log in. Once this is complete you can run `./docker-publish.sh` to publish your image to the server.

## Deploy ENLIL
<!-- Who needs to be made aware of a release? What limitations/restrictions are there before making a
release? For example, is there an explicit vetting process, or perhaps certain time windows when a
release shouldn't be made? -->

### Bump the version

From the `dev` branch, run `npm version <major | minor | patch>` where major indicates a breaking change, minor is noticeable but non-breaking interface change, and patch is a non-breaking, under-the-hood refinement.

This will:

* run the linter and unit tests and abort if they fail
* increment the version, commit the change, and create a git tag
* push the changes and the new tag to the remote repo

### Deploy to AWS

Merge `dev` into `main`. From main, `npm run build:prod` to create the `dist/` folder. Upload the contents of `dist/` to AWS. The deployed site should reflect the code contained in the `main` branch.

<!-- ### Deploy to GitHub pages

From the main branch, run `npm run deploy`

This will:

* Run `npm run build:pages` to create the `/docs` directory that will be deployed
* Make a copy of `docs/index.html` and name it `docs/404.html` (for some reason the angular instructions say to do this)
* Take the current build of `/docs` from the current branch and push it up to the remote `gh-pages` branch were it will be served

After a few minutes, you will see the changes at the GitHub-hosted site https://swxtrec.github.io/enlil.

You can run this script from any branch, but the site should reflect the content of the current main branch. -->
