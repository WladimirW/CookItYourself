class MySnapshot
{
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor(private video: HTMLVideoElement,
              private imgSnapshot: HTMLImageElement)
  {
    AssertNotNull(this.video);
    AssertNotNull(this.imgSnapshot);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  InitVideo(resolve, reject)
  {
    navigator.mediaDevices.getUserMedia({audio: false, video: true})
        .then(stream =>
           {
             if ("srcObject" in this.video)
             {
               this.video.srcObject = stream;
             }           
             else
             {
                this.video.src = window.URL.createObjectURL(stream);
             }
             resolve();
           }).catch(reason =>
           {
             reject(reason);
           });
  }

  Snapshot()
  {
    this.canvas.width = this.video.clientWidth;
    this.canvas.height = this.video.clientHeight;
    this.ctx.drawImage(this.video, 0, 0);
  }

  Get(callback)
  {
    this.canvas.toBlob(function(blob) { callback(blob); }, 'image/jpeg', 0.95);
  }

  FreezeSnapshotImage()
  {
    this.imgSnapshot.src = this.canvas.toDataURL('image/webp');
  }

  EnableVideoDesableImage(onoff:boolean)
  {   
      this.imgSnapshot.style.display = onoff ? 'none' : 'block';
      this.video.style.display = !onoff ? 'none' : 'block';
  }
}

class MyScreen
{
  constructor(private btnCapture: HTMLButtonElement,
              private divResultArea: HTMLElement)
  {
    AssertNotNull(this.btnCapture);
    AssertNotNull(this.divResultArea);
  }

  OnFailSoHard(e)
  {
    this.DisableCaptureButton();
    let msg = "Video stream is not available.";
    if(e)
      msg += JSON.stringify(e)
    this.SetResultText(msg);
  }

  AppendContents(contents): void
  {
    this.divResultArea.appendChild(contents);
  }

  SetResultText(text: string): void
  {
    this.divResultArea.innerHTML = text;
  }

  DisableCaptureButton(): void
  {
    this.btnCapture.disabled = true;
  }

  EnableVideoDesableImage(txt:string, onoff:boolean)
  {
      this.btnCapture.textContent = txt;
      this.btnCapture.disabled = false;
  }

  static CreateFaceInfoAsUList(faceInfo: object): HTMLUListElement
  {
    let newList = document.createElement("ul");
    for (var key in faceInfo)
      {
        if (!faceInfo.hasOwnProperty(key))
          continue;
        let newItem = document.createElement("li");
        var obj = faceInfo[key];
        newItem.textContent = key + ": " + obj;
        newList.appendChild(newItem);
    }
    return newList;
  }
}

class MyApp
{
    mySnapshot: MySnapshot;
    myScreen: MyScreen;
    swithToVideo = false;

    constructor(btnCapture: HTMLButtonElement,
                divResultArea: HTMLElement,
                video:HTMLVideoElement,
                imgSnapshot: HTMLImageElement)
    {
        this.myScreen = new MyScreen(btnCapture, divResultArea);
        this.mySnapshot = new MySnapshot(video, imgSnapshot);
    }

    public Initialize(): Promise<void>
    {
      return new Promise<void>((resolve, reject) =>
      {
        this.mySnapshot.InitVideo(resolve, reason => 
          {
            if(reason.name)
            {
              if(reason.name === "DevicesNotFoundError")
              {
                this.myScreen.OnFailSoHard("Attach a camera");
                reject(reason);
                return;
              }
            }
            this.myScreen.OnFailSoHard({reason: "Browser does not support this functionality. Contact a developer."});
            reject(reason);
          });
      });
    }

    public EnableVideo(): void
    {
      this.mySnapshot.EnableVideoDesableImage(true);
      this.myScreen.SetResultText("");
      this.myScreen.EnableVideoDesableImage("Capture image from camera", true);
    }

    public Snapshot()
    {
      if(this.swithToVideo)
      {
        this.EnableVideo();
        this.swithToVideo = false;
      }
      else
      {
        this.mySnapshot.Snapshot();
        this.mySnapshot.FreezeSnapshotImage();
        this.mySnapshot.EnableVideoDesableImage(false);
        this.myScreen.EnableVideoDesableImage("Switch to video", false);
        this.swithToVideo = true;
        this.ProcessImage();
      }
    }

    ProcessImage(): void
    {
      this.myScreen.SetResultText("Processing...");
      this.mySnapshot.Get(blob => this.MakeRequest(blob));
    }

    private MakeRequest(blob)
    {
      let req = { url: "recognize",
                    beforeSend: function(xhrObj)
                    {
                        xhrObj.setRequestHeader("Content-Type","application/octet-stream");
                    },
                    type: "POST",
                    data: blob,
                    processData: false
                };
      $.ajax(req).done( data => this.ProcessResponse(data))
                 .fail( () => this.InformAboutError());
    }

    private InformAboutError()
    {
      this.myScreen.SetResultText("An error while processing occured, please try again or contact a developer...");
      alert("An unknown and unexpected error occured.");
    }

    private ProcessResponse(data): void
    {
      if(data.error)
        this.ShowError(data);
      else
        this.ShowResult(data);
    }

    private ShowError(data: any)
    {
      this.myScreen.SetResultText("An error occured. Please contact a developer. " + JSON.stringify(data));
    }

    private ShowResult(data: any)
    {
    }
}

let myApp: MyApp;

function AssertNotNull(arg): void
{
  if(!arg)
    throw Error("Argument is null.");
}

window.onload = function()
{
  try
  {
    let divResultArea = document.getElementById('result');
    AssertNotNull(divResultArea);
    let btnCapture = <HTMLButtonElement>document.getElementById('capture');
    btnCapture.onclick = () => { if (myApp) myApp.Snapshot() };
    let video = <HTMLVideoElement>document.getElementById('video');
    let imgSnapshot = <HTMLImageElement> document.getElementById('snapshot');
    let app = new MyApp(btnCapture, divResultArea, video, imgSnapshot);
    app.Initialize().then(function()
      {
        myApp = app;
        myApp.EnableVideo();
      }).catch(reason =>
      {
        console.log(reason);
      });
  }
  catch(err)
  {
    let divResultArea = document.getElementById('result');
    if(divResultArea)
    {
      divResultArea.textContent = "A severe error in application occured. Contact a developer. " + err;
    }
    else
    {
      console.log("A severe error in application occured. Contact a developer.", err);
    }
  }
};
