export class CreateOrder extends HTMLElement {
    static properties = {
        doctorList: { type: Array },
        patientOwner: { type: Array },
        requestHeaders: { type: Object },
    };

    constructor() {
        super();
        this.doctorList = [];
        this.patientOwner = [];
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render();
    }

    connectedCallback() {
        // debugger;
        this.shadowRoot.querySelector('h3').innerText = this.getAttribute('widgetName');
        // this.render();

        let settingsBtn = this.shadow.querySelector('#settings');
        settingsBtn.addEventListener('click', this.onClickSettings.bind(this))

        const addPanelTestBtn = this.shadow.querySelector('#addPanelTestBtn');
        addPanelTestBtn.addEventListener('click', this.addPanelTest.bind(this))

        let submitBtn = this.shadow.querySelector('#submitBtn');
        submitBtn.addEventListener('click', this.onSubmit.bind(this))

        const addKey = this.shadow.querySelector('#addKey');
        addKey.addEventListener('click', this.addKeyHander.bind(this))

        let token = localStorage.authDetails ? JSON.parse(localStorage.authDetails).access_token : null;
        this.requestHeaders = new Headers({
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + token
        });

        if (token) {
            this.getDoctorList();
            this.getPatientOwnerList();
        }
    }

    onClickSettings() {
        debugger
        console.log('settings clicked');
    }

    addKeyHander() {
        const keyValue = this.shadow.querySelector('#keyValue');
        let token = { access_token: keyValue.value };
        localStorage.setItem('authDetails', JSON.stringify(token));
        location.reload();
    }

    getDoctorList() {
        var requestBody = {
            method: 'GET',
            mode: "cors",
            cache: "no-cache",
            headers: this.requestHeaders,
        };
        const url = 'https://stagingapi.zoetisdx.com/api/v28/GetOrderFilterDDLList/e99e0c82-318b-4ff3-bb81-42c9f7769466/1';
        // const url = './data/doctors.json';
        return fetch(url, requestBody).then((res) => {
            res.json().then((result) => {
                this.doctorList = result.ResponseData.DoctorList;
                const drsSelect = this.shadowRoot.querySelector('#drs');
                for (let i = 0; i < this.doctorList.length; i++) {
                    let optionElement = document.createElement('option');
                    optionElement.value = this.doctorList[i].Id;
                    optionElement.innerHTML = this.doctorList[i].ProviderIdName;
                    drsSelect.appendChild(optionElement);
                }
            })
        }).catch(err => {
            console.error(err)
        });
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

    getPatientOwnerList() {
        const params = {
            BusinessGuid: "e99e0c82-318b-4ff3-bb81-42c9f7769466",
            Filter: "zoetis"
        }
        const url = 'https://stagingapi.zoetisdx.com/api/v28/GetPatientOwnerDDLList';
        // const url = './data/patient-owner-ddl-data.json';
        this.postRequest(url, params).then((result) => {
            this.patientOwner = result.ResponseData.PatientOwner;
            const patientOwnerElement = this.shadowRoot.querySelector('#paod');
            for (let i = 0; i < this.patientOwner.length; i++) {
                let optionElement = document.createElement('option');
                optionElement.value = JSON.stringify(this.patientOwner[i]); // this.patientOwner[i];
                optionElement.innerHTML = this.patientOwner[i].PatientName;
                patientOwnerElement.appendChild(optionElement);
            }
        }).catch(err => {
            console.error(err)
        });
    }

    onSubmit(event) {
        event.preventDefault();

        let selectedDr = this.shadowRoot.querySelector('#drs').value;
        let paod = this.shadowRoot.querySelector('#paod').value;
        let patient = JSON.parse(paod);
        let additionalNotes = this.shadowRoot.querySelector('#additionalNotes').value;
        console.log(selectedDr);
        console.log(patient);
        console.log(additionalNotes);
        // debugger
        const params = { "DoctorId": "9729949153", "BusinessGuid": "e99e0c82-318b-4ff3-bb81-42c9f7769466", "Patient": { "patientId": "5375", "OwnerFirstName": "", "OwnerLastName": "Zoetis Tester1", "firstname": "A0;S004", "lastname": "Zoetis Tester1", "gender": "Male Neutered", "birthday": "2020-06-30T20:00:00", "species": "Canine", "breed": " " }, "Tests": [{ "Code": "SIMU_3000_RA" }], "Notes": "ddddddddddddddddd" }
        // {
        //     "DoctorId": selectedDr, // "9729949153",
        //     "BusinessGuid": "e99e0c82-318b-4ff3-bb81-42c9f7769466",
        //     // "Patient": JSON.parse(paod),
        //     "Patient": {
        //         OwnerFirstName: patient.OwnerFirstName,
        //         OwnerLastName: patient.OwnerLastName,
        //         birthday: "2020-06-30T20:00:00", // patient.LastResultDate
        //         breed: patient.Breed,
        //         firstname: patient.PatientFirstName,
        //         gender: patient.Gender,
        //         lastname: patient.PatientLastName,
        //         patientId: patient.PatientId,
        //         species: patient.Species,
        //     },
        //     "Tests": [{ "Code": "SIMU_2000_PF" }],
        //     "Notes": additionalNotes
        // }
        console.log(params);
        const url = 'https://stagingapi.zoetisdx.com/api/v28/AddOrderDetail';

        this.postRequest(url, params).then((result) => {
            let responseData = result.DisplayMessage;
            if (result.IsSuccess) {
                this.shadowRoot.querySelector('#resPonseMessage').innerHTML = 'Order submitted successfully...!';
            }
            this.shadowRoot.querySelector('#additionalNotes').value = '';
        }).catch(err => {
            console.error(err)
        });
    }

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
        @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

            .widget{
                position:relative;
                background: #e1dbdb;
                border: 1px solid black;
                box-shadow: 2px 6px 12px;
                margin: 30px auto;
                padding: 30px;
                max-width: 750px;
            }

            .settings{
                position: absolute;
                right: 25px;
                top: 55px;
            }
    
            h3{
                text-align: center;
                margin: 15px 0px 50px 0px;
                font-weight: bold;
            }
           
            .footer{
                text-align: right;
            }
        </style>
        <div class="widget">
        <div class="container">
            <div class="row">
                <div class="settings"> 
                    <i id="settings" class="fa fa-cog" aria-hidden="true"></i> 
                </div>
                <!-- <div id="addKeyPopup">
                    <div class="row">
                        <div class="col-10">                    
                        <input type="text" name="keyValue" id="keyValue" class="form-control">
                        </div>
                        <div class="col-2">
                            <button id="addKey" class="btn btn-primary">Add key </button>
                        </div>
                    </div> -->
                </div>
                <div class="col-12">
                    <h3> Create Order </h3>
                </div>               
            </div>
            <div class="row mt-4 mb-4" style="text-align: right;">
                <div class="col-12" style="text-align:left;color: #fd6400;"> 
                    <label>Add access key to enable widget</label> <br/> 
                </div>
                <div class="col-10">                    
                    <input type="text" name="keyValue" id="keyValue" class="form-control">
                </div>
                <div class="col-2">
                    <button id="addKey" class="btn btn-primary">Add key </button>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <form id="createOrderForm" method="post">
                        <div class="form-row">
                            <div class="col">
                                <label for="drs"> Doctor ID:</label>
                                <select id="drs" class="custom-select" name="doctor"> 
                                <!-- <option value="Test Dorctor">Test Dorctor</option> -->
                                </select>
                            </div>
                            <div class="col">
                                <label for="paod"> Pet & Owner Details:</label>
                                <select id="paod" class="custom-select" name="paod">
                                    <!-- <option value="Test Pet/Woner">Test Pet/Woner</option> -->
                                </select>
                            </div>
                            <div class="col">
                                <label> . </label>
                                <button class="form-control btn btn-primary"> Create a new patient </button>
                            </div>
                        </div>
                        <div class="form-row mt-4">
                            <div class="col">
                                <label> Select Panels/Tests </label>
                                <button id="addPanelTestBtn" class="btn btn-primary">Add </button>
                            </div>
                        </div>

                        <div class="form-row mt-4">
                            <div class="col">
                                <label for="additionalNotes"> Additional Notes:</label>
                                <textarea id="additionalNotes" class="form-control" name="additionalNotes" rows="4"
                                    cols="50"> </textarea>
                            </div>
                        </div>
                        <div class="form-row mt-4 footer">
                            <p id="resPonseMessage" style="color: green; font-size: 15px;"> </p>
                            <div class="col">
                                <button class="btn btn-danger"> Cancel </button>
                                <button class="btn btn-primary" id="submitBtn" type="submit"> Submit </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </div>
        `;
    }


}
