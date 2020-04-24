var path = "./patient_data/qcMCO"
function myFunction2(){
  var fso, f, fc, s, temp, list;
  fso = new ActiveXObject("Scripting.FileSystemObject");
  f = fso.GetFolder(path);
  fc = new Enumerator(f.files);
  s = "";
  temp = "";
  for (; !fc.atEnd(); fc.moveNext())
  {
    temp = fc.item();
    s = temp.name;
    //list = document.getElementById('filelist').options[document.getElementById('filelist').options.length] = new Option (s, s);
    document.getElementById(s).classList.toggle("show");
  };
}
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
