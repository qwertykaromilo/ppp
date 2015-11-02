<%@ page import="com.core.entity.User" %>
<%@ page import="com.core.helpers.TempHelper" %>
<%@ page import="com.core.helpers.URLHelper" %>
<%@ page import="com.core.meta.pages.AbstractPage" %>
<%@ page import="com.core.meta.exceptions.ForwardException" %>
<%@ page import="com.core.meta.exceptions.RedirectException" %>
<%
    AbstractPage thisPage = new AbstractPage(request, response) {
        @Override
        protected void authorize() throws Exception {
            if (getUser() == null) throw new RedirectException("/login/");
        }

        @Override
        protected void execute() throws Exception {
            throw new RedirectException("/menu/");
        }

    };
    thisPage.executeRequest();

%>