import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    awsUrl: string = environment.aws.api;

    constructor(
        private _http: HttpClient
    ) { }

    startEc2() {
        // StartEC2Instances.py lambda link
        return this._http.get( this.awsUrl + '/BrianTestStartEC2');
        // const API_URL = 'https://d5t5sqiqed.execute-api.us-east-1.amazonaws.com/BrianTestStartEC2';

        // const request = new XMLHttpRequest();
        // request.open('GET', API_URL);
        // request.send();
        // request.onload = () => {
        //     console.log(request);
        //     if (request.status === 200) {
        //   // Immediately reload status update
        //         this.getEC2Status();
        //         console.log(request.response);
        //     } else {
        //         console.log(`error ${request.status} ${request.statusText}`);
        //     }
        // };
    }

    stopEC2() {
        // StopEC2Instances.py lambda link
        this._http.get( this.awsUrl + '/BrianTestStopEC2');

        // const API_URL = 'https://d5t5sqiqed.execute-api.us-east-1.amazonaws.com/BrianTestStopEC2';
        //
        // const request = new XMLHttpRequest();
        // request.open('GET', API_URL);
        // request.send();
        // request.onload = () => {
        //     console.log(request);
        //     if (request.status === 200) {
        //         console.log(request.response);
        //   // Immediately reload status update
        //         this.getEC2Status();
        //     } else {
        //         console.log(`error ${request.status} ${request.statusText}`);
        //     }
        // };
    }

    getEC2Status() {
        // CheckEC2Status.py lambda link
        this._http.get( this.awsUrl + 'BrianTestStatusEC2');

      //   const API_URL = 'https://d5t5sqiqed.execute-api.us-east-1.amazonaws.com/BrianTestStatusEC2';
      //
      //   const request = new XMLHttpRequest();
      //   request.open('GET', API_URL);
      //   request.send();
      //   console.log(request);
      //   request.onload = () => {
      // // Split response
      //       console.log(request.responseText);
      //       const array = request.responseText.split(',');
      //       console.log(array);
      //       const eC2state = array[0];
      //       const eC2status = array[1];
      //       console.log(`${eC2state} ${eC2status}`);
      //
      //
      //       if (request.status === 200 && (eC2state === 'stopped' || eC2state === 'terminated')) {
      //     // document.getElementById('status').innerHTML = '<p>The Visualizer EC2 instance is currently shutdown. Please press the start button to startup the EC2 instance. Once the EC2 instance is running you will be redirected to the visualizer page.</p><button class='btn default' onClick='startEC2()'>Start EC2</button>';
      //       } else if (request.status === 200 && eC2state === 'pending') {
      //     // document.getElementById('status').innerHTML = '<p>The EC2 instance is currently starting, please wait, and you will soon be redirected to the visualizer page. This process may take a few minutes.</p>';
      //       } else if (request.status === 200 && eC2state === 'running' && eC2status === 'initializing') {
      //     // document.getElementById('status').innerHTML = '<p>The EC2 instance is now running, please wait while the visualizer application is started. This process takes around 3 minutes.</p>';
      //       } else if (request.status === 200 && eC2state === 'running' && eC2status === 'ok') {
      //     // document.getElementById('status').innerHTML = '<p>The EC2 instance is now running and you will be soon be redirected to the visualizer page. (For now please just click the link:) <a href='http://paraview.swx-trec.com:8080' target='_blank' rel='noopener noreferrer'> Enlil Visualizer </a> <br><br> If you are no longer utilizing the visualizer, please stop the EC2 instance: <button class='btn default' onClick='stopEC2()'>Stop EC2</button></p>';
      //       } else if (request.status === 200 && (eC2state === 'stopping' || eC2state === 'shutting-down')) {
      //     // document.getElementById('status').innerHTML = '<p>The EC2 instance is currently shutting down. If you need to utilize the visualizer, please wait a moment and you will have the opportunity to restart the EC2 instance. This process may take a few minutes.</p>';
      //       } else {
      //           console.log(`error ${request.status} ${request.statusText}`);
      //       }
      //   };
    }



}
