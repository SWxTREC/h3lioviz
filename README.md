# H3lioViz

Deployed site: <https://swx-trec.com/h3lioviz>

This is a frontend for visualizing 3D heliosphere model output.

## Contacts

* **Product Owner:**
    Greg Lucas, greg.lucas@lasp.colorado.edu
* **Experienced Devs:**
    Front end: Jennifer Knuth, jennifer.knuth@lasp.colorado.edu
    Back end: Greg Lucas, greg.lucase@lasp.coloardo.edu

## Relevant JIRA Project(s)

* [SWT](https://jira.lasp.colorado.edu/projects/SWT/): Main project for the
    Space Weather Model Staging Platform codebase.

## Related Projects

NA

## Production URLs

<https://swx-trec.com/h3lioviz>

## Necessary Permissions

Access to AWS S3 console is currently required to deploy.

## Architecture

This is a visualizer for the 3D heliosphere model built with Angular.

## Running H3lioViz Locally

See 'Development server' below.

### Project Dependencies

A backend with the H3lioViz paraview server is required.

`npm run start:dev` or `npm run start:prod` to use the production backend deployed to AWS.

`npm start` is the local development environment and will require a local backend. The 'dev' deploy can be found at <https://dev.swx-trec.com/h3lioviz>

To test with a local paraview server, follow the README instructions in the h3lioviz-server repo <https://github.com/SWxTREC/h3lioviz-server> for running a local docker container containing the backend and some relevant data.

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

## DOCKER

### Building a docker image

You can run `./dockerctl.sh b` to build a new image locally

### Running a dev image locally

Once you have built your image using the command above, you can `./dockerctl.sh r` to start a local development image. This image will be served at `http://localhost:8080/dev`

To stop your image run `./dockerctl.sh s`

Cleaning up old images is also a good idea from time to time. To clean up your unused docker resources run `docker system prune`

### Pushing an image to the LASP web registry

When you are ready to push your image, contact the web team infrastructure group for credentials and instructions on how to log in. Once this is complete you can run `./dockerctl.sh p` to publish your image to the server.

## Deploy H3lioViz

Merges to the `dev` branch will automatically be deployed to <https://dev.swx-trec.com/h3lioviz>. This is the `dev` deploy in the AWS environment and the contents of the `dev` branch will be reflected there.

Be sure to `npm run lint && npm test` before merging to the `dev` branch.

### Version and release

Once <https://dev.swx-trec.com/h3lioviz> is tested and ready for a release, merge `dev` into `main`. From the `main` branch, run `npm version <major | minor | patch>` where major indicates a breaking change, minor is noticeable but non-breaking interface change, and patch is a non-breaking, under-the-hood refinement.

This will:

* run the linter and unit tests and abort if they fail
* increment the version, commit the change, and create a git tag
* push the changes and the new tag to the remote repo
* merge the version changes back into the dev branch

### Deploy to AWS

Run this Jenkins job https://jenkins-build.lasp.colorado.edu/job/swx-h3lioviz-prod/ to make a production build. Currently there is a manual step to deploy to the production AWS environment. Notify Brian McClellan or Greg Lucas to do this step. In future this will be automated.
