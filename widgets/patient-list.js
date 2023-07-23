export class PatientList extends HTMLElement {
    static properties = {
        token: { type: String },
        requestHeaders: { type: Object },
        PatientList: { type: Array },
    };

    constructor() {
        super();
        this.PatientList = [];
        this.shadow = this.attachShadow({ mode: 'open' });

        this.token = localStorage.authDetails ? JSON.parse(localStorage.authDetails).access_token : null;
        this.requestHeaders = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + this.token
        });

        this.render();
    }

    connectedCallback() {
        // debugger;
        this.shadowRoot.querySelector('h3').innerText = this.getAttribute('widgetName');
        let patientId = this.getAttribute('patientId');
        console.log('patientId => ', patientId);
        // this.render();

        const tblContainer = this.shadow.querySelector('#tblContainer');
        tblContainer.addEventListener('scroll', this.onTableScroll.bind(this))

        if (this.token) {
            this.getPatientList();
        }
    }

    addKeyHander() {
        const keyValue = this.shadow.querySelector('#keyValue');
        let token = { access_token: keyValue.value };
        localStorage.setItem('authDetails', JSON.stringify(token));
        location.reload();
    }

    async postRequest(url = "", data = {}) {
        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: this.requestHeaders,
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(data),
        });
        return response.json();
    }

    params = {
        "IsExactFilter": false,
        "IsBackOfficeUser": false,
        "BusinessGuid": "e99e0c82-318b-4ff3-bb81-42c9f7769466",
        PatientId: null,// "130145",
        "PatientName": null,
        "AnalysisSourceId": 0,
        "AnalysisStatusId": 0,
        "AnalysisTypeId": 0,
        "AnalysisTypeName": null,
        "Analyzer": null,
        "SpeciesId": 0,
        "Breed": "",
        "OwnerName": null,
        "FromDate": null,
        "ToDate": null,
        "SearchText": null,
        "UserGuid": "d8d90cde-746f-48d2-a2fd-b8dcfc16d5fa",
        "LanguageId": 1,
        "PhysicianName": null,
        "isFollowedPatient": false,
        "SpeciesName": null,
        "GenderId": 0,
        "IsApplyFilter": true,
        "PageNo": 1,
        "PageSize": 60
    }

    getPatientList() {
        const spinner = this.shadow.querySelector('#spinner');
        spinner.style.display = 'block';
        const url = 'https://stagingapi.zoetisdx.com/api/v28/GetPatients';
        this.postRequest(url, this.params).then((result) => {
            if (result.ResponseData.PatientList != null && result.ResponseData.PatientList.length > 0) {
                this.PatientList = this.PatientList.concat(result.ResponseData.PatientList);
                this.isLoadMore = true;
            } else {
                this.isLoadMore = false;
            }
            let tblBody = this.shadowRoot.querySelector('#tblBody');
            tblBody.innerHTML = '';
            for (let i = 0; i < this.PatientList.length; i++) {
                let tblRow = document.createElement('tr');
                let colums = `                     
                    <td>${this.PatientList[i].PatientId}</td>
                    <td>${this.PatientList[i].PatientName}</td>
                    <td>${this.PatientList[i].OwnerName}</td>
                    <td>${this.PatientList[i].SpeciesName}</td>
                    <td>${this.PatientList[i].BreedName}</td>
                    <td>${this.PatientList[i].GenderName}</td>
                    <td>${this.PatientList[i].DateReceivedStr}</td>                    
                    `;
                tblRow.innerHTML = colums;
                tblBody.appendChild(tblRow);
                spinner.style.display = 'none';
            }

        }).catch(err => {
            console.error(err);
            this.spinner.style.display = 'none';
        });
    }

    onTableScroll(e) {
        const tableViewHeight = e.target.offsetHeight;
        const tableScrollHeight = e.target.scrollHeight;
        const scrollLocation = e.target.scrollTop;

        const buffer = 200;
        const limit = tableScrollHeight - tableViewHeight - buffer;
        if (this.isLoadMore && scrollLocation > limit) {
            this.isLoadMore = false;
            this.params.PageNo++;
            this.getPatientList();
        }
    }


    // onSubmit(event) {
    //     event.preventDefault();

    //     let selectedDr = this.shadowRoot.querySelector('#drs').value;
    //     let paod = this.shadowRoot.querySelector('#paod').value;
    //     let patient = JSON.parse(paod);
    //     let additionalNotes = this.shadowRoot.querySelector('#additionalNotes').value;
    //     console.log(selectedDr);
    //     console.log(patient);
    //     console.log(additionalNotes);
    //     // debugger
    //     const params = {
    //         "DoctorId": selectedDr, // "9729949153",
    //         "BusinessGuid": "e99e0c82-318b-4ff3-bb81-42c9f7769466",
    //         // "Patient": JSON.parse(paod),
    //         "Patient": {
    //             OwnerFirstName: patient.OwnerFirstName,
    //             OwnerLastName: patient.OwnerLastName,
    //             birthday: "2023-03-04T19:00:00", // patient.LastResultDate
    //             breed: patient.Breed,
    //             firstname: patient.PatientFirstName,
    //             gender: patient.Gender,
    //             lastname: patient.PatientLastName,
    //             patientId: patient.PatientId,
    //             species: patient.Species,
    //         },
    //         "Tests": [{ "Code": "SIMU_2000_PF" }],
    //         "Notes": additionalNotes
    //     }
    //     console.log(params);
    //     const url = 'https://stagingapi.zoetisdx.com/api/v28/AddOrderDetail';

    //     this.postRequest(url, params).then((result) => {
    //         let responseData = result.DisplayMessage;
    //         if (result.IsSuccess) {
    //             this.shadowRoot.querySelector('#resPonseMessage').innerHTML = 'Order submitted successfully...!';
    //         }
    //         this.shadowRoot.querySelector('#additionalNotes').value = '';
    //     }).catch(err => {
    //         console.error(err)
    //     });
    // }

    static get observedAttributes() {
        return ['doctorList']
    }

    attributeChangedCallback(prop, newVal, oldVal) {
        debugger
        console.log('attributeChangedCallback called');
        if (prop === 'doctorList') {
            this.doctorList = JSON.parse(this.attributes.doctorList.value);
            console.log('doctorList =>', this.doctorList);
            this.render();
        }
    }

    addPanelTest() {
        const addPanelTestBtn = this.shadowRoot.querySelector('#addPanelTestBtn')
        console.log('addPanelTestBtn clicked');
    }


    render() {
        this.shadow.innerHTML = `
        <style>
        @import url("https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css");

            .widget{
                background: #e1dbdb;
                border: 1px solid black;
                box-shadow: 2px 6px 12px;
                margin: 30px auto;
                padding: 30px;
                max-width: 90%;
                min-height: 650px;
                position:relative;
            }
    
            h3{
                text-align: center;
                margin: 14px 0px 14px 0px
                font-weight: bold;
            }
            .tblContainer{
                max-height: 500px;
                overflow-y: scroll;
            }
           
            table tbody{
                position: relative;
                top: 50px;
            }
            .spiner-container{
                position: absolute;
                top: 0px;
                left: 0px;
                z-index: 99;
                height: 100%;
                width: 100%;
                background: grey;
                opacity: 0.7;
                display:none;
            }
            .spinner{
                position: absolute;
                top: 50%;
                left: 50%;
                z-index: 99;
            }
           
            .footer{
                text-align: right;
            }
        </style>
        <div class="widget">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h3> Patient List </h3>
                </div>               
            </div>
            <div id="spinner" class="spiner-container">
                <div class="spinner-border spinner" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <!-- <div class="row mt-4 mb-4" style="text-align: right;">
                <div class="col-12" style="text-align:left;color: #fd6400;"> 
                    <label>Add access key to enable widget</label> <br/> 
                </div>
                <div class="col-10">                    
                    <input type="text" name="keyValue" id="keyValue" class="form-control">
                </div>
                <div class="col-2">
                    <button id="addKey" class="btn btn-primary">Add key </button>
                </div>
            </div> -->
            <div class="row">
                <div id="tblContainer" class="col tblContainer">

                <table class="table table-striped">
                    <thead>
                    <tr>
                        <th scope="col">Patient ID</th>
                        <th scope="col">Patient Name</th>
                        <th scope="col">Owner Name</th>
                        <th scope="col">Species</th>
                        <th scope="col">Breed</th>
                        <th scope="col">Sex</th>
                        <th scope="col">Last Analysis</th>
                    </tr>
                    </thead>
                    <tbody id="tblBody"> </tbody>
                </table>

                </div>
            </div>
        </div>
        </div>
        `;
    }
}