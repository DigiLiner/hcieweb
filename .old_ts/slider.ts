document.addEventListener('DOMContentLoaded', function() {
    stdSlider('sliderContainerWidth',1,100,1);
    stdSlider('sliderContainerOpacity',0,100,100);
    stdSlider('sliderContainerBlur',0,30,2);//todo: change as hardness 0-100%
    stdSlider('sliderContainerRadius',2,300,50,'none');
    stdSlider('sliderContainerDensity',20,300,100,'none');

   // barSlider('test',50,100,50);
})


function barSlider(id:string,min=1,max=100,value=50) {
    const sliderContainer: HTMLDivElement = document.getElementById('sliderContainerNew') as HTMLDivElement;
let s:CSSStyleDeclaration = sliderContainer.style;
s.width='150px';
s.height='20px';
s.backgroundColor='#aaa';
//i want to draw on this div with mouse move event
    //it's must be like a slider with min,max,value, and on change event
    // i want to get the value of slider and set it to g.pencil_width, g.spray_radius, g.spray_density, g.opacity
    s.border = '1px solid #000';
    s.position = 'relative';
    s.left = '0px';
    s.top = '0px';

    const sliderBar: HTMLDivElement = document.createElement('div');

    const text = document.createElement('span');
    text.style.position =  'absolute';
    text.style.color = '#fff';
    text.style.left = '50%';
    text.style.fontSize = '12px';
    text.style.fontWeight = 'bold';
    text.textContent = '50%';



    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.style.marginRight = '0px';
    plusButton.style.position = 'absolute';
    plusButton.style.height = '100%';
    plusButton.style.top = '0%';
    plusButton.style.right = '0%';

    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.style.position = 'absolute';
    minusButton.style.height = '100%';
    minusButton.style.top = '0%';
    minusButton.style.left = '0%';
    minusButton.style.width = '24px';

    sliderBar.style.width = '50%';
    sliderBar.style.height = '100%';
    sliderBar.style.backgroundColor = '#05f';
    sliderBar.style.position = 'absolute';
    sliderBar.style.left = '24px';
    sliderBar.style.top = '0';


    sliderContainer.appendChild(plusButton);
    sliderContainer.appendChild(minusButton);
    sliderContainer.appendChild(sliderBar);
   sliderContainer.appendChild(text);
    plusButton.style.zIndex = '999';
    minusButton.style.zIndex = '999';
    sliderContainer.addEventListener('mousemove', (e: MouseEvent) => {
        if(e.buttons === 1) {
            const rect = sliderContainer.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const percentage = (offsetX / rect.width) * 100;
            sliderBar.style.width = `${percentage}%`;
            text.textContent = `${Math.round(percentage)}%`;
            const value = Math.round((percentage / 100) * (max - min)) + min;
            console.log(value); // Replace with setting the value to g.pencil_width, g.spray_radius, g.spray_density, g.opacity
        }
    });


}


function stdSlider(id:string, min=1, max=100, value=50,display='flex') {
// Create slider container
    const sliderContainer: HTMLDivElement = document.getElementById(id)as HTMLDivElement;
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.marginTop = '0px';
    sliderContainer.style.width = '140px';
    sliderContainer.style.display = display;
    // Create minus button
    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.style.marginRight = '0px';
    sliderContainer.appendChild(minusButton);

    // Create slider input
    const slider = document.createElement('input')as HTMLInputElement;
    slider.type = 'range';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.value = value.toString();
    slider.style.marginRight = '0px';
    slider.style.width='80px';
    sliderContainer.appendChild(slider);

    // Create value display
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = slider.value;
    sliderContainer.appendChild(valueDisplay);

    // Create plus button
    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.style.marginLeft = '0px';
    sliderContainer.appendChild(plusButton);

    // Append slider container to body
    //document.body.appendChild(sliderContainer);

    // Update value display when slider is moved
    slider.addEventListener('input', function() {
        valueDisplay.textContent = slider.value;
        setValue(id, slider.value)
        
    });

    // Decrease value when minus button is clicked
    minusButton.addEventListener('click', function() {
        if (parseInt(slider.value) > parseInt(slider.min)) {
            slider.value = (parseInt(slider.value) - 1).toString();
            valueDisplay.textContent = slider.value;
            setValue(id,slider.value)
        }
       
    });

    // Increase value when plus button is clicked
    plusButton.addEventListener('click', function() {
        if (parseInt(slider.value) < parseInt(slider.max)) {
            slider.value =  (parseInt(slider.value) + 1).toString();
            valueDisplay.textContent = slider.value;
            setValue(id,slider.value)
        }
    });
}
function setValue(id:string,value:string) {
    const val:number = parseInt(value);
    switch (id) {
        case 'sliderContainerWidth':
            g.pen_width = val;
            break;
        case 'sliderContainerRadius':
            g.spray_radius=val
            break;
        case'sliderContainerDensity':
            g.spray_density=val
            break;
        case'sliderContainerOpacity':
            g.pen_opacity=val/100
            break;
            case'sliderContainerBlur':
            g.pen_blur=val
        default:
            break;
    }
}


