# H3lioViz

Deployed site: <https://swx-trec.com/h3lioviz>

This is a frontend for visualizing 3D heliosphere model output.

Title: H3lioViz
Description: Visualize model runs that propagate the solar wind through the three-dimensional heliosphere
Tagline: Explore solar wind models in three dimensions

## Contacts

* **Product Owner:**
    Greg Lucas, greg.lucas@lasp.colorado.edu
* **Experienced Devs:**
    Front end: Jennifer Knuth, jennifer.knuth@lasp.colorado.edu
    Back end: Greg Lucas, greg.lucas@lasp.coloardo.edu

## Relevant JIRA Project(s)

* [SWT](https://jira.lasp.colorado.edu/projects/SWT/): Main project for the
    Space Weather Model Staging Platform codebase.

## Related Projects

GitHub organization: https://github.com/SWxTREC

This is one of a suite of applications deployed to the SWx TREC Model Staging Platform at https://swx-trec.com.
A definitive list of swx-trec apps can be found in the model file at https://bitbucket.lasp.colorado.edu/projects/WEBAPPS/repos/swx-trec/browse/src/app/models/swt-apps.ts as well as a list in Confluence at https://confluence.lasp.colorado.edu/x/6IOpCg

## Design Source Files

Find design source files in: smb://lasp-store/divisions/Mods/Data_Sys/Web/design/h3lioviz
Shared assets for the SWT suite of applications are hosted in AWS at https://swx-trec.com/swx-trec-assets/general/

## Deployed URLs

Deployed site: https://swx-trec.com/h3lioviz
Dev site: https://dev.swx-trec.com/h3lioviz
Branch demos: https://dev.swx-trec.com/h3lioviz/`<branch-name>`/DEMO/

## Necessary Permissions

Jenkins jobs are used to deploy the application and the application is built on internal libraries, so development needs to be done behind the firewall.

## Architecture

This is a visualizer for the 3D heliosphere model built with Angular.

It connects via a websocket to a paraview server.

## Running H3lioViz Locally

When developing this library, use the version of Node specified in package.json, under `engines`.

See 'Development server' below.

### Project Dependencies

A backend with the H3lioViz paraview server is required.

`npm run start:dev` or `npm run start:prod` to use the production backend deployed to AWS.

`npm start` is the local development environment and will require a local backend. The 'dev' deploy can be found at <https://dev.swx-trec.com/h3lioviz>

To test with a local paraview server, follow the README instructions in the h3lioviz-server repo <https://github.com/SWxTREC/h3lioviz-server> for running a local docker container containing the backend and some relevant data.

### Development server

Run `npm run start:dev` or `npm run start:prod` to serve the frontend locally and connect to one of the deployed AWS backends. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Local build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory. Run `npm run build:prod` for a production build.

Because of the websocket, this project still uses the old webpack build engine and it does not have the additional `/browser` path in the dist folder that is created by the newer Angular application builder.

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

Once you have built your image using the command above, you can `./dockerctl.sh r` to start a local development image. This image will be served at `http://localhost:4200` and connect to the websocket via port 8080

To stop your image run `./dockerctl.sh s`

Cleaning up old images is also a good idea from time to time. To clean up your unused docker resources run `docker system prune`

### Pushing an image to the LASP web registry

When you are ready to push your image, contact the web team infrastructure group for credentials and instructions on how to log in. Once this is complete you can run `./dockerctl.sh p` to publish your image to the server.

## Deploy H3lioViz
Be sure to `npm run lint && npm test` before merging to the `dev` branch.

When a PR is created, the branch is served, and can be reviewed, outside of the LASP network at https://dev.swx-trec.com/h3lioviz/`<branch-name>`/DEMO/. The branch deploy will update with changes to the branch code.

Merges to the `dev` branch will automatically be deployed to <https://dev.swx-trec.com/h3lioviz>. This is the `dev` deploy in the AWS environment and the contents of the `dev` branch will be reflected there.

To manually trigger a deploy of the dev branch, run this job: https://jenkins-build.lasp.colorado.edu/job/swx-h3lioviz-dev/

### Version and release

Once <https://dev.swx-trec.com/h3lioviz> is tested and ready for a release:

#### Update HISTORY.md with changes

Copy the previous release heading from assets/markdown/CHANGELOG.md to the top of assets/markdown/HISTORY.md.

Above that, add the new features, changes, and fixes that have happened in the frontend and to the model since the last release.

In the `package.json`, replace the `"startingVersion": "x.xx.x"`, with the upcoming release version.

Commit and push these updates.

#### Version and deploy

Merge `dev` into `main`. From the `main` branch, run `npm version <major | minor | patch>` where major indicates a breaking change, minor is noticeable but non-breaking interface change, and patch is a non-breaking, under-the-hood refinement.

This will:

* run the linter and unit tests and abort if they fail
* increment the version, commit the change, and create a git tag
* generate the changelog
* push the changes and the new tag to the remote repos (origin and external)
* merge the version changes back into the dev branch

Note that the version number will be correct in the code for the dev branch, but the deployed version in dev will only be updated on the next run of the dev-build Jenkins job.

### Deploy production to AWS

To make a production build and deploy to AWS, run this Jenkins job https://jenkins-build.lasp.colorado.edu/job/swx-h3lioviz-prod/.
