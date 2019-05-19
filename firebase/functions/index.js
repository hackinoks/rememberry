
'use strict';

function random(low, high) {
	
  return Math.floor(Math.random() * (high - low) + low)

}


var counter=3;

const HELP_PROMPTS = [
   'Ben kişisel asistanın Rememberry. Bazı günlük temel aktivitelerin nasıl yapıldığını sana hatırlatmak için hazırlandım. İlaç saatlerini düzende tutmak gibi konularda destek olmak için buradayım sana nasıl yardımcı olabilirim?',
   'Ben Rememberry, senin kişisel asistanınım ilaç saatlerini unuttuğunda veya bir aktiviteyi yapmakta sıkıntı yaşadığında benden yardım isteyebilirsin. Şimdi senin için ne yapabilirim?',
];

const {
  dialogflow,
  Permission,
  Suggestions,
} = require('actions-on-google');

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');


// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

var welcomeAgainWords = ['Hey geri gelmişsin', 'Seni yeniden görmek çok güzel', 'Seni özlemiştim', 'Tekrar hoşgeldiniz', 'Hoşgeldin eski dostum'];

var firstWelcomeWords = ['Hoşgeldiniz', 'Hoşgeldin' , 'Rememberry\'e Hoşgeldiniz', 'Merhaba' , 'Hoşgeldiniz'];


// Set the DialogflowApp object to handle the HTTPS POST request.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
	 counter = 3;
	conv.data.lastParen =  `Tamam o zaman isimsiz bir şekilde devam edelim. Beni tanımak için sen kimsin demen yeterlidir veya doğrudan öğrenmek istediğin aktiviteleri girebilirsin.`;
    conv.ask(`Tamam o zaman isimsiz bir şekilde devam edelim. Beni tanımak için sen kimsin demen yeterlidir veya doğrudan öğrenmek istediğin aktiviteleri girebilirsin.`);
    conv.ask(new Suggestions('Sen kimsin?','İlaç içmek', 'Telefon araması yapmak', 'Karşıdan karşıya geçmek'));
  } else {
	  counter = 3;
	conv.data.lastParen = 'Teşekkürler' +conv.user.storage.userName+' beni tanımak için sen kimsin demen yeterlidir veya doğrudan öğrenmek istediğin aktiviteleri girebilirsin.';
    conv.user.storage.userName = conv.user.name.display; 
    conv.ask('Teşekkürler' +conv.user.storage.userName+' beni tanımak için sen kimsin demen yeterlidir veya doğrudan öğrenmek istediğin aktiviteleri girebilirsin.');
    conv.ask(new Suggestions('Sen kimsin?','İlaç içmek', 'Telefon araması yapmak', 'Karşıdan karşıya geçmek'));
  }
});

app.intent('Help Intent', (conv) => {
	counter = 3;
	conv.data.lastParen = HELP_PROMPTS[random(0,2)];
	conv.ask(HELP_PROMPTS[random(0,2)]);
	conv.ask(new Suggestions( 'İlaç içmek', 'Telefon araması yapmak', 'Karşıdan karşıya geçmek'));
	
});

app.intent('Repeat', (conv) => {
	counter = 3;
	conv.ask(conv.data.lastParen); 
	
	
});


app.intent('KarsidanGecme', (conv) => {
	counter = 3;
	conv.data.lastParen = 'Yola inmeden önce kaldırımın kenarında dur.Önce Sola, daha sonra sağa, tekrar sola bakılarak yol kontrol edilir, eğer araç gelmiyorsa yürünür, yolun ortasına gelindiğinde tekrar sağa bakılarak,yine koşmadan hızlı adımlarla yürünür.';
	conv.ask('Yola inmeden önce kaldırımın kenarında dur.Önce Sola, daha sonra sağa, tekrar sola bakılarak yol kontrol edilir, eğer araç gelmiyorsa yürünür, yolun ortasına gelindiğinde tekrar sağa bakılarak,yine koşmadan hızlı adımlarla yürünür.');
	conv.ask(new Suggestions('Tekrarla'));
});

var fs = require('fs');

app.intent('Hap Intent', async (conv) => {
	counter = 3;
	
	
	var file =  await fs.readFileSync('ilacdata.json', 'utf8');
	var json =  JSON.parse(file);
	var date = new Date();
	var current_hour = date.getHours();
	
	var printString = '';
	
    if(current_hour >= 18){
		printString = printString+ "Akşam içmen gereken ilaçlar ve özellikleri:\n";
        for(var i in json.aksam ){
            printString=printString+i+"\n";
            printString=printString+json.aksam[i].type + " kullanılır.\n";
            printString=printString+"yan etkileri: "+json.aksam[i].yanetki + ".\n";
            
        }
    }else if(18> current_hour >= 12){
        printString = printString+ "Öğlen içmen gereken ilaçlar ve özellikleri:\n";
        for(var i in json.ogle ){
            printString=printString+i+"\n";
            printString=printString+json.ogle[i].type + " kullanılır.\n";
            printString=printString+"yan etkileri: "+json.ogle[i].yanetki + ".\n";
            
        }
    }
    else if(current_hour < 12){
        printString = printString+ "Sabah içmen gereken ilaçlar ve özellikleri:\n";
        for(var i in json.sabah ){
            printString=printString+i+"\n";
            printString=printString+json.sabah[i].type + " kullanılır.\n";
            printString=printString+"yan etkileri: "+json.sabah[i].yanetki + ".\n";
            
        }
    }
	conv.data.lastParen = printString;	
	conv.ask(printString);
	
});


app.intent('actions_intent_CANCEL2', (conv) => {
	var date = new Date();
	var current_hour = date.getHours();
	if(current_hour<18){
		
		if(conv.user.storage.userName){
			conv.close('İyi günler ' + conv.user.storage.userName);
	}else{
			conv.close('İyi günler ');
	}
	
		
	}else{
		if(conv.user.storage.userName){
			conv.close('İyi akşamlar ' + conv.user.storage.userName);
	}else{
			conv.close('İyi akşamlar ');
	}
		
	}
	
});

app.intent('Call Intent', (conv) => {
	counter = 3;
	conv.data.lastParen = 'Öncelikle telefona erişmek gerekiyor, telefonun yerini hatırlıyor musun?';
	conv.ask('Öncelikle telefona erişmek gerekiyor, telefonun yerini hatırlıyor musun?');
	conv.ask(new Suggestions('Evet','Hayır'));
	
});


app.intent('Call Intent - yes', (conv) => {
	counter = 3;
	conv.data.lastParen = 'Harika ekranın altında ortadaki butona dokunarak tuş kilidini aç. Açtıktan sonra \"devam"\ diyerek devam edebilirsin.';
	conv.ask('Harika ekranın altında ortadaki butona dokunarak tuş kilidini aç. Açtıktan sonra \"devam"\ diyerek devam edebilirsin.');
	conv.ask(new Suggestions('Devam'));
	
});
app.intent('Call Intent - no', (conv) => {
	counter = 3;
	const audioSound = 'https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg';
	conv.ask(`<speak> Telefonunu çaldırıyorum... Eğer bulursan \"evet\", bulamazsan tekrar çaldırmak için \"hayır\" demen yeterlidir. ` +  `<audio src="${audioSound}"></audio></speak>`);
	conv.ask(new Suggestions('Evet','Hayır'));
	
	
	
});

app.intent('Call Intent - no - yes', (conv) => {
	counter = 3;
	conv.data.lastParen ='Harika ekranın altında ortadaki butona dokunarak tuş kilidini aç.  Açtıktan sonra \"devam"\ diyerek devam edebilirsin.';
	conv.ask('Harika ekranın altında ortadaki butona dokunarak tuş kilidini aç.  Açtıktan sonra \"devam"\ diyerek devam edebilirsin.');
	conv.ask(new Suggestions('Devam'));
	
	
});

app.intent('Call Intent - no - no', (conv) => {
	counter = 3;
	const audioSound = 'https://actions.google.com/sounds/v1/alarms/medium_bell_ringing_near.ogg';
	conv.ask(`<speak> Telefonunu tekrar çaldırıyorum... Eğer bulursan \"evet\", bulamazsan tekrar çaldırmak için \"hayır\" demen yeterlidir. ` +  `<audio src="${audioSound}"></audio></speak>`);
	conv.ask(new Suggestions('Evet','Hayır'));
	
});

app.intent('Call Intent - no - no - yes', (conv) => {
	counter = 3;
	conv.data.lastParen ='Harika ekranın altındaki ortadaki butona dokunarak tuş kilidini aç.  Açtıktan sonra \"devam"\ diyerek devam edebilirsin.';
	conv.ask('Harika ekranın altındaki ortadaki butona dokunarak tuş kilidini aç.  Açtıktan sonra \"devam"\ diyerek devam edebilirsin.');
	conv.ask(new Suggestions('Devam'));
});

app.intent('Call Intent - no - no - no', (conv) => {
	if(conv.user.storage.userName){
		conv.close('Telefonunuzu  bulamadım. Daha sonra tekrar deneyin ' + conv.user.storage.userName);
	}else{
		conv.close('Telefonunuzu  bulamadım. Daha sonra tekrar deneyin. ');

	}
});

app.intent('Call Intent - yes - yes', (conv) => {
	counter = 3;
	conv.data.lastParen = 'Sonra sol alt köşede üzerinde telefon simgesi olan rehber butonuna dokun. Dokunduktan sonra rehberde aramak istediğiniz ismin üstüne dokunun. Dokunduktan sonra \"devam"\ diyerek devam edebilirsin.';
	conv.ask('Sonra sol alt köşede üzerinde telefon simgesi olan rehber butonuna dokun. Dokunduktan sonra rehberde aramak istediğiniz ismin üstüne dokunun. Dokunduktan sonra \"devam"\ diyerek devam edebilirsin.');
	conv.ask(new Suggestions('Devam'));
	
});

app.intent('Call Intent - yes - yes - yes', (conv) => {
	counter = 3;
	conv.data.lastParen = 'Arayacağın kişinin adına dokunduktan sonra arama başlayacaktır. Şimdi ne yapmamı istersin?';
	conv.ask('Arayacağın kişinin adına dokunduktan sonra arama başlayacaktır. Şimdi ne yapmamı istersin?');
	conv.ask(new Suggestions('İlaç içmek', 'Telefon araması yapmak', 'Karşıdan karşıya geçmek', 'Kapat'));
	
});


const noMatch = [
   'Anlayamadım.',
   'Tekrar söyler misiniz algılayamadım.',
   'Anlayamadım. Tekrar söyleyebilir misiniz?',
   'Ne dediğinizi anlamadım. Tekrar söyler misiniz?' , 
   'Anlamakta zorluk çekiyorum tekrar eder misiniz'
];


app.intent('Default Fallback Intent', (conv) => {
	if(conv.user.storage.userName){
		
		if(counter==3){
		counter=counter-1;
		
		conv.ask(noMatch[random(0,5)] + ' ' + conv.user.storage.userName );
		
		}else if(counter==2){
			counter=counter-1;

			conv.ask(noMatch[random(0,5)] + ' ' + conv.user.storage.userName );
			
		}else if(counter == 1){
			
			conv.close(noMatch[random(0,5)] + ' ' + conv.user.storage.userName);
		}
	
	}else{
		if(counter==3){
		counter=counter-1;
		
		conv.ask(noMatch[random(0,5)] );
		
		}else if(counter==2){
			counter=counter-1;

			conv.ask(noMatch[random(0,5)] );
			
		}else if(counter == 1){
			
			conv.close(noMatch[random(0,5)]);
		}
		
	}
	
	
});

app.intent('actions_intent_CANCEL', (conv) => {
	
		if(counter==3){
		counter=counter-1;
		conv.ask(noMatch[0]);
		
		}else if(counter==2){
			counter=counter-1;
			conv.ask(noMatch[1]);
			
		}else if(counter == 1){
			
			conv.close(noMatch[2]);
		}
		
	
	
	
});

app.intent('actions_intent_NO_INPUT', (conv) => {
  
	const repromptCount = parseInt(conv.arguments.get('REPROMPT_COUNT'));
  if (repromptCount === 0) {
	  
    conv.ask('Boş bir input girdiniz.');
  } else if (repromptCount === 1) {
	  
    conv.ask(`Tekrar boş bir input girdiniz.`);
  } else if (conv.arguments.get('IS_FINAL_REPROMPT')) {
	  
    conv.close(`Üzgünüm çok fazla başarısız input girme işlemi gerçekleştirdiniz. İyi günler...`);
  }
  
});

app.intent('Default Welcome Intent', (conv) => {
 //conv.user.storage = {};
 const name = conv.user.storage.userName; 
 if (!name) {
   conv.ask(new Permission({
     context: firstWelcomeWords[random(0,5)],
     permissions: 'NAME',
   }));
 } else {
	counter = 3;
	conv.data.lastParen = welcomeAgainWords[random(0,5)] + ' ' +name+' eğer beni hatırlamıyorsan sen kimsin diyerek hakkımda detaylı bilgi alabilirsin veya doğrudan hatırlamak istediğin aktiviteyi söyleyebilirsin.';
   conv.ask(welcomeAgainWords[random(0,5)] + ' ' +name+' eğer beni hatırlamıyorsan sen kimsin diyerek hakkımda detaylı bilgi alabilirsin veya doğrudan hatırlamak istediğin aktiviteyi söyleyebilirsin.');
   conv.ask(new Suggestions('Sen kimsin?','İlaç içmek', 'Telefon araması yapmak', 'Karşıdan karşıya geçmek' , 'Kapat'));
 } 
 
	
});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);



