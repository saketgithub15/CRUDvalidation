const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Employee = mongoose.model('Employee');

router.get('/', (req, res) => {
    res.render("employee/addOrEdit", {
        viewTitle: "Insert Employee"
    });
});

router.post('/', async (req, res) => {
    try {
        if (req.body._id == '')
       await  insertRecord(req, res);
        else
       await updateRecord(req, res);
    } catch (error) {
        res.send(`${error}: Unable to load the data`)
    }
});
const insertRecord = async (req, res) =>{
    let employee = new Employee();
    employee.fullName = req.body.fullName;
    employee.email = req.body.email;
    employee.salary = req.body.salary;
    employee.designation = req.body.designation;
     await employee.save((err, doc) => {
        if (!err)
            res.redirect('employee/list');
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("employee/addOrEdit", {
                    viewTitle: "Insert Employee",
                    employee: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
}

const updateRecord = async(req, res) => {
   await Employee.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('employee/list'); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("employee/addOrEdit", {
                    viewTitle: 'Update Employee',
                    employee: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}
 
router.get('/login', (req, res)=>{
    res.render('employee/login')
})



router.post('/login', async (req, res)=>{
   try {
        const name = req.body.fullName
        const email = req.body.email
 
       const userEmail = await Employee.findOne({email})

        if(userEmail.fullName === name){
            res.status(201).render("employee/list", {
                list:{userEmail}
            })
        }
        else{
            res.send('invalid Match')
        }


   } catch (error) {
       res.status(400).send('invalid login')
   }
})


router.get('/list', (req, res) => {
    Employee.find((err, docs) => {
        if (!err) {
            res.render("employee/list", {
                list: docs
            });
        }
        else {
            console.log('Error in retrieving employee list :' + err);
        }
    });
});

// router.post('/', async (req, res)=>{
//     try {
//          const name = req.body.sfullName
//          const email = req.body.semail  
//         console.log(`${name}, ${email}`)

//         const userEmail = await Employee.findOne({email})
//         res.render(userEmail);
//          if(userEmail.fullName === name){
//              res.status(201).render("employee/list", {
//                  list:{userEmail}
//              })
//          }
//          else{
//              res.send('invalid Match')
//          } 
//     } catch (error) {
//         res.status(400).send('invalid login')
//     }
//  })

function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'fullName':
                body['fullNameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            case 'salary':
                body['salaryError'] = err.errors[field].message;
                break;
            case 'designation':
                body['designationError'] = err.errors[field].message;
                break;
           
        }
    }
}

router.get('/:id', (req, res) => {
    Employee.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("employee/addOrEdit", {
                viewTitle: "Update Employee",
                employee: doc
            });
        }
    });
});

router.get('/delete/:id', (req, res) => {
    Employee.findOneAndDelete(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/employee/list');
        }
        else { console.log('Error in employee delete :' + err); }
    });
});

module.exports = router;