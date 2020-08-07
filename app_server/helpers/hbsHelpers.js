let hbsHelpers = {
    nameOrEmpty: function(name) {
        // les 2 cas ont été testés 
        if (name === undefined || name==="") {
            return "ID vide.. a régler côté Arduino"
        }
        return name;
    },
    tokenExpired: function(mixed) {
        if (mixed==="expired") {
            return true;
        }
        else { return false; }
    },
    isUser: function(role) {
        if (role === "user") {
            return true;
        }
        else {return false; }
    },
    isAdmin: function(role) {
        if (role === "admin") {
            return true; 
        }
        else { return false;}
    },
    isSuperAdmin: function(role) {
        if (role === "superadmin") {
            return true; 
        }
        else { return false;}
    },
    displayGroupsWithCheckedAccessUser: function(accessTo, groups){
        var str = ''; 
        for (var i=0; i<groups.length; i++) {
            str+= '<label class="checkbox">'; 
            if (accessTo && accessTo.indexOf(groups[i].groupId)>-1) {
                // l'user a accès à ce groupe : checked
                str+= '<input type="checkbox" name="userGroupAccess" value='+groups[i].groupId+' checked>'+groups[i].name ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="userGroupAccess" value='+groups[i].groupId+'>'+groups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayGroupsWithCheckedAccessAdmin: function(accessTo, groups){
        var str = ''; 
        for (var i=0; i<groups.length; i++) {
            str+= '<label class="checkbox">'; 
            if (accessTo && accessTo.indexOf(groups[i].groupId)>-1) {
                // l'user a accès à ce groupe : checked
                str+= '<input type="checkbox" name="adminGroupAccess" value='+groups[i].groupId+' checked> '+groups[i].name ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="adminGroupAccess" value='+groups[i].groupId+'> '+groups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayUserGroupsWithChecked: function(toCheck, userGroups){
        var str = ''; 
        for (var i=0; i<userGroups.length; i++) {
            str+= '<label class="checkbox">'; 

            if (toCheck && toCheck.indexOf(userGroups[i].name)>-1) {
                // l'user a accès à ce groupe : checked
                str+= '<input type="checkbox" name="userGroup" value='+encodeURI(userGroups[i].name)+' checked> '+userGroups[i].name ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="userGroup" value='+encodeURI(userGroups[i].name)+'> '+userGroups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayGroupsWithCheckedAdmin: function(isAdmin, groups){
        var str = ''; 
        for (var i=0; i<groups.length; i++) {
            str+= '<label class="checkbox">'; 
            if (isAdmin && isAdmin.indexOf(groups[i].groupId)>-1) {
                // l'user est administrateur de ce groupe : checked
                str+= '<input type="checkbox" name="adminGroupAdmin" value='+groups[i].groupId+' checked> '+groups[i].name ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="adminGroupAdmin" value='+groups[i].groupId+'> '+groups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayGroupsWithChecked: function (toCheck, groups, name) {
        var str = ''; 
        for (var i=0; i<groups.length; i++) {
            str+= '<label class="checkbox">'; 
            if (toCheck && toCheck.indexOf(groups[i].groupId)>-1) {
                str+= '<input type="checkbox" name="'+name+'" value='+groups[i].groupId+' checked> '+groups[i].name ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="'+name+'" value='+groups[i].groupId+'> '+groups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayUsersChecked: function(groupId, users, name){
        var str = ''; 
        for (var i=0; i<users.length; i++) {
            str+= '<label class="checkbox">'; 
            if (groupId && users[i].accessTo.indexOf(groupId)>-1) {
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(users[i].username)+' checked> '+users[i].username ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(users[i].username)+'> '+users[i].username ;
            }
            str+='</label> - ';
        }   
        return str;
    },
    displayAdminsChecked: function(groupId, users, name){
        var str = ''; 
        for (var i=0; i<users.length; i++) {
            str+= '<label class="checkbox">'; 
            if (groupId && users[i].isAdmin.indexOf(groupId)>-1) {
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(users[i].username)+' checked> '+users[i].username ;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(users[i].username)+'> '+users[i].username ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayUsersGroupsChecked: function(groupId, groups, name){
        var str = ''; 
      
        for (var i=0; i<groups.length; i++) {
            str+= '<label class="checkbox">'; 
            if (groupId && groups[i].accessTo && groups[i].accessTo.indexOf(groupId)>-1) {
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(groups[i].name)+' checked> '+groups[i].name;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(groups[i].name)+'> '+groups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    displayUsersGroupsAdminsChecked: function(groupId, groups, name){
        var str = ''; 
        for (var i=0; i<groups.length; i++) {
            str+= '<label class="checkbox">'; 
            if (groupId && groups[i].isAdmin && groups[i].isAdmin.indexOf(groupId)>-1) {
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(groups[i].name)+' checked> '+groups[i].name;
            }
            else {
                // not checked 
                str+= '<input type="checkbox" name="'+name+'" value='+encodeURI(groups[i].name)+'> '+groups[i].name ;
            }
            str+='</label> - ';
        }
        return str;
    },
    toJSON: function(object) {
        return JSON.stringify(object);
    },
}

module.exports = hbsHelpers;