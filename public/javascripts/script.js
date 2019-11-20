google.charts.load('current', {
  'packages':['geochart'],
  // Note: you will need to get a mapsApiKey for your project.
  // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
//  'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY'
});

var app = new Vue({
  el: '#app',
  data: {
    file: '',
    uploadedNames: [],
    name: '',
    csvString: '',
    message: 'Hello Vue!',
    data: ''
  },
  methods: {
    getList() {
      try {
        axios.get('http://localhost:3000/csvs')
          .then(function (response) {
            console.log(response);
            app.uploadedNames = response.data;
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      catch (err) {
        console.log(err);
        this.message = err.response.data.error;
      }
    },
    getData(name) {
      try {
        axios.get('http://localhost:3000/csvs/' + name)
          .then(function (response) {
            console.log(response);
            app.data = response.data;
            app.loadMap();
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      catch (err) {
        console.log(err);
        this.message = err.response.data.error;
      }
    },
    loadMap() {
        console.log(JSON.stringify(this.data));

        var table = [];
        var headers = [];
        for (var key in this.data[0]) {
          headers.push(key);
        }
        table.push(headers);

        this.data.forEach(obj => {
          row = []
          headers.forEach(header => {
            float = parseFloat(obj[header]);
            if (isNaN(float)) {
              row.push(obj[header]);
            }
            else {
              row.push(float);
            }
          });
          table.push(row);
        });

        console.log(table);

        var data = google.visualization.arrayToDataTable(table);

        var options = {};

        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

        chart.draw(data, options);

    },
    onSelect() {
        const allowedTypes = ["text/csv"];
        const file = this.$refs.file.files[0];
        this.file = file;
        this.name = file.name;

        if (!allowedTypes.includes(file.type)) {
          this.message = "Only csvs are allowed";
        }
        else if (file.size>500000) {
          this.message = "Too large. Max size allowed is 500KB";
        }
        else {
          var fileInput = document.getElementById("csv");
          console.log(fileInput);
          var reader = new FileReader();
          var vm = this;
          reader.onload = function() {
            app.csvString = reader.result;
            // app.data.csvString = reader.result;
          }
          reader.readAsText(fileInput.files[0]);
        }
    },
    async onSubmit() {
      console.log("ONSUBMTI");
      console.log(this.csvString);
      if (this.csvString != 'hi') {
        try {
          await axios.post('http://localhost:3000/upload', { name: this.name, file: this.csvString});
          this.message = 'Uploaded';
        }
        catch (err) {
          console.log(err);
          this.message = err.response.data.error;
        }
      }

    }
  }
})
